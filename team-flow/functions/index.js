const {v4: uuidv4} = require("uuid");
const functions = require("firebase-functions/v2/https");
const cors = require("cors")({origin: true});
const admin = require("firebase-admin");


admin.initializeApp();


const runtimeOpts = {
  region: "europe-west3",
};


exports.joinTeam = functions.onRequest(runtimeOpts, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (!req.body.accessCode || !req.body.userUid) {
      res.status(400).send("Access code and user UID are required");
      return;
    }

    const accessCode = req.body.accessCode;
    const userUid = req.body.userUid;

    try {
      const db = admin.firestore();
      const teamsRef = db.collection("teams");
      const snapshot = await teamsRef
          .where("accessCode", "==", accessCode).get();

      if (snapshot.empty) {
        res.status(404).send("No team found with the given access code");
        return;
      }

      const teamDoc = snapshot.docs[0];
      const teamId = teamDoc.id;

      // Dodanie użytkownika do zespołu
      await teamsRef.doc(teamId).update({
        memberIds: admin.firestore.FieldValue.arrayUnion(userUid),
      });

      // Dodajemy dokument do 'userChats' kolekcji
      await db.doc(`userChats/${userUid}/teamChats/${teamId}`).set({});
      // Dodajemy dokument do 'teamMembers' podkolekcji w 'teams'
      await db.doc(`teams/${teamId}/teamMembers/${userUid}`).set({
        id: userUid,
      });

      res.status(200).send({teamId});
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(500).send("Error joining team");
    }
  });
});


exports.getUserData = functions.onRequest(runtimeOpts, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const userId = req.query.userId;

    if (!userId) {
      res.status(400).send("User ID is required");
      return;
    }

    const db = admin.firestore();

    try {
      const userDocRef = db.collection("users").doc(userId);
      const docSnap = await userDocRef.get();

      if (!docSnap.exists) {
        res.status(404).send("No user found with the given ID");
        return;
      }

      const userData = docSnap.data();
      res.status(200).send(userData);
    } catch (error) {
      console.error("Error fetching user data: ", error);
      res.status(500).send("Error fetching user data");
    }
  });
});


exports.createTeam = functions.onRequest(runtimeOpts, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const {teamName, userUid} = req.body;

    if (!teamName || !userUid) {
      res.status(400).send("Team name and user UID are required");
      return;
    }

    try {
      const db = admin.firestore();
      const newTeamRef = db.collection("teams").doc();

      await db.runTransaction(async (transaction) => {
        transaction.set(newTeamRef, {
          name: teamName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          memberIds: [userUid],
          adminIds: [userUid],
          accessCode: uuidv4(),
        });

        transaction.set(db
            .doc(`userChats/${userUid}/teamChats/${newTeamRef.id}`), {});
        transaction.set(db
            .doc(`teams/${newTeamRef.id}/teamMembers/${userUid}`),
        {id: userUid});
      });

      res.status(200).send({teamId: newTeamRef.id});
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).send("Error creating team");
    }
  });
});

exports.getUserTeams = functions.onRequest(runtimeOpts, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const userUid = req.query.userUid;

    if (!userUid) {
      res.status(400).send("User UID is required");
      return;
    }

    try {
      const db = admin.firestore();
      const teamsQuery = db.collection("teams")
          .where("memberIds", "array-contains", userUid);
      const querySnapshot = await teamsQuery.get();

      const teams =
        querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      res.status(200).send(teams);
    } catch (error) {
      console.error("Error getting user teams:", error);
      res.status(500).send("Error getting user teams");
    }
  });
});

exports.isUserTeamAdmin = functions
    .onRequest(runtimeOpts, (req, res) => {
      cors(req, res, async () => {
        if (req.method !== "GET") {
          res.status(405).send("Method Not Allowed");
          return;
        }

        const {teamId, userUid} = req.query;

        if (!teamId || !userUid) {
          res.status(400).send("Team ID and user UID are required");
          return;
        }

        try {
          const db = admin.firestore();
          const teamDocRef = db.collection("teams").doc(teamId);
          const docSnap = await teamDocRef.get();

          if (!docSnap.exists) {
            res.status(404).send("Team not found");
            return;
          }

          const teamData = docSnap.data();
          const isAdmin = teamData.adminIds.includes(userUid);
          res.status(200).send({isAdmin});
        } catch (error) {
          console.error("Error checking team admin status:", error);
          res.status(500).send("Error checking team admin status");
        }
      });
    });


exports.getTeamData = functions
    .onRequest(runtimeOpts, (req, res) => {
      cors(req, res, async () => {
        if (req.method !== "GET") {
          res.status(405).send("Method Not Allowed");
          return;
        }

        const teamId = req.query.teamId;

        if (!teamId) {
          res.status(400).send("Team ID is required");
          return;
        }

        try {
          const db = admin.firestore();
          const teamDocRef = db.collection("teams").doc(teamId);
          const teamDocSnapshot = await teamDocRef.get();

          if (teamDocSnapshot.exists) {
            const teamData =
            {id: teamDocSnapshot.id, ...teamDocSnapshot.data()};
            res.status(200).send(teamData);
          } else {
            res.status(404).send("No such team");
          }
        } catch (error) {
          console.error("Error getting team data:", error);
          res.status(500).send("Error getting team data");
        }
      });
    });

exports.markNotificationsRead = functions.onRequest(runtimeOpts, (req, res) => {
  const cors = require("cors")({origin: true});
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {teamId, userId} = req.body;
    if (!teamId || !userId) {
      return res.status(400).send("Team ID and User ID are required");
    }

    try {
      const db = admin.firestore();
      const notificationsRef = db.collection("teams").doc(teamId)
          .collection("teamMembers").doc(userId)
          .collection("notifications");

      const querySnapshot = await notificationsRef.get();
      const batch = db.batch();

      let unreadCount = 0;
      querySnapshot.forEach((doc) => {
        if (!doc.data().isRead) {
          batch.update(doc.ref, {isRead: true});
          unreadCount++;
        }
      });

      await batch.commit();

      return res.status(200).send({updatedCount: unreadCount});
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return res.status(500).send("Error updating notifications");
    }
  });
});
