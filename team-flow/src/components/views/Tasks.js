import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';
import TaskItem from '../common/TaskItem';
import { addDoc, collection, Timestamp, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase'; // ścieżka do Twojej konfiguracji Firebase
import { Button, Dropdown, Form, Modal } from 'react-bootstrap';
import { useUserTeamData } from '../../contexts/TeamContext';
import Select from 'react-select';
import AvatarMini from '../common/AvatarMini';
import { useUser } from '../../contexts/UserContext';
import ToggleSwitch from '../common/ToggleSwitch';
import SubtaskItem from '../common/SubtaskItem';
import { ReactComponent as ArrowUpIcon } from '../../assets/arrow-up.svg'
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg'
import { useAuth } from '../../contexts/AuthContext';

const sortOptions = [
  { label: 'deadline: ascending', value: 'deadline_asc' },
  { label: 'deadline: descending', value: 'deadline_desc' },
  { label: 'title: ascending', value: 'title_asc' },
  { label: 'title: descending', value: 'title_desc' },
  { label: 'progress: ascending', value: 'progress_asc' },
  { label: 'progress: descending', value: 'progress_desc' }
];

export default function Tasks() {
  const [showModal, setShowModal] = useState(false);
  const { isLoading, teamId } = useTeamExists();
  const { getTeamData } = useUserTeamData()
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskDeadline, setTaskDeadline] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersOptions, setUsersOptions] = useState([]);
  const { getUserData } = useUser()
  const today = new Date().toISOString().split('T')[0];
  const [priority, setPriority] = useState('medium');
  const [modalPage, setModalPage] = useState(1);
  const [isTeamTasksExpanded, setIsTeamTasksExpanded] = useState(false);
  const [isUserTasksExpanded, setIsUserTasksExpanded] = useState(false);
  const [isPinnedTasksExpanded, setIsPinnedTasksExpanded] = useState(false);
  const [pinnedTasks, setPinnedTasks] = useState([]);
  const [sortOptionTeam, setSortOptionTeam] = useState('deadline_asc');
  const [sortOptionYour, setSortOptionYour] = useState('deadline_asc');
  const [sortOptionPinned, setSortOptionPinned] = useState('deadline_asc');

  const sortTasks = (tasks, option) => {
    switch (option) {
      case 'deadline_asc':
        return [...tasks].sort((a, b) => a.deadline.seconds - b.deadline.seconds);
      case 'deadline_desc':
        return [...tasks].sort((a, b) => b.deadline.seconds - a.deadline.seconds);
      case 'title_asc':
        return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return [...tasks].sort((a, b) => b.title.localeCompare(a.title));
      case 'progress_asc':
        // Założenie: progres to ilość ukończonych podzadań
        return [...tasks].sort((a, b) => a.subtasks.filter(s => s.isCompleted).length - b.subtasks.filter(s => s.isCompleted).length);
      case 'progress_desc':
        return [...tasks].sort((a, b) => b.subtasks.filter(s => s.isCompleted).length - a.subtasks.filter(s => s.isCompleted).length);
      default:
        return tasks;
    }
  };

  const { currentUser } = useAuth();
  const userTasks = tasks.filter(task => task.assignedUsers.includes(currentUser.uid));

  useEffect(() => {
    // Filtruj zadania przypięte przez bieżącego użytkownika
    const filteredPinnedTasks = tasks.filter(task =>
      task.pinned.includes(currentUser.uid)
    );
    setPinnedTasks(filteredPinnedTasks);
  }, [tasks, currentUser.uid]); // Zależności: zmiana zadań lub ID użytkownika


  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'teams', teamId, 'tasks'),
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksData);
      },
      (error) => {
        console.error("Error fetching tasks: ", error);
      }
    );

    return () => unsubscribe(); // Wyczyść nasłuchiwacz podczas odmontowywania komponentu
  }, [teamId]);

  const toggleTeamTasks = () => {
    setIsTeamTasksExpanded(!isTeamTasksExpanded);
  };

  const toggleUserTasks = () => {
    setIsUserTasksExpanded(!isUserTasksExpanded);
  };

  const togglePinnedTasks = () => {
    setIsPinnedTasksExpanded(!isPinnedTasksExpanded);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'teams', teamId, 'tasks'));
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    };

    if (teamId) {
      fetchTasks();
    }
  }, [teamId]);

  const addSubtask = () => {
    if (subtaskInput.trim() !== '') {
      setSubtasks([...subtasks, { name: subtaskInput, isCompleted: false, assignedUsers: [] }]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (indexToRemove) => {
    setSubtasks(subtasks.filter((_, index) => index !== indexToRemove));
  };

  const goToNextPage = () => {
    setModalPage(2);
  };

  const goBackToFirstPage = () => {
    setModalPage(1);
  };


  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (teamId) {
        const teamData = await getTeamData(teamId);
        console.log(teamData)
        if (teamData && teamData.memberIds) {
          const userOptions = await Promise.all(
            teamData.memberIds.map(async userId => {
              const userData = await getUserData(userId);
              return {
                value: userId,
                label: userData.fullName, // Załóżmy, że każdy użytkownik ma pole fullName
              };
            })
          );

          setUsersOptions(userOptions);
        }
      }
    };

    fetchData();
  }, [teamId, getUserData]);

  const CustomOption = props => {
    return (
      <div {...props.innerProps} className="d-flex align-items-center p-3 task-select-user">
        <AvatarMini userId={props.data.value} alt={props.data.label} style={{ outline: "none" }} />
        <span className="ms-2">{props.data.label}</span>
      </div>
    );
  };

  const handleSelectChange = selectedOptions => {
    setSelectedUsers(selectedOptions);
    console.log(selectedUsers)
  };

  const resetForm = () => {
    // Resetowanie stanów formularza
    setTaskTitle('');
    setTaskDescription('');
    setTaskDeadline('');
    setSelectedUsers([]);
    setSubtasks([]);
    setSubtaskInput('');
  };

  const handleSaveTask = async () => {
    // Logika zapisywania zadania
    // Po zapisaniu możesz zamknąć modal lub zresetować stan strony

    const preparedSubtasks = subtasks.map(subtask => {
      return {
        ...subtask,
        assignedUsers: subtask.assignedUsers ? subtask.assignedUsers.map(user => user.value) : []
      };
    });

    const assignedUserIds = selectedUsers.map(user => user.value); // Zakładając, że selectedUsers jest tablicą obiektów z kluczem 'value'

    const taskData = {
      title: taskTitle,
      description: taskDescription,
      creationDate: Timestamp.fromDate(new Date()), // Przykład
      deadline: Timestamp.fromDate(new Date(taskDeadline)),
      priority: priority,
      state: 'in progress',
      assignedUsers: assignedUserIds,
      subtasks: preparedSubtasks,
      pinned: []

      // ...
    };

    try {
      await addDoc(collection(db, 'teams', teamId, 'tasks'), taskData);
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task: ', error);
    }
    setShowModal(false);
    setModalPage(1);
    resetForm()
  };

  if (isLoading) {
    return <MainLayout><Loading /></MainLayout>;
  }

  const handleClose = () => {
    setShowModal(false);
  }
  const handleShow = () => {
    setShowModal(true)
    setModalPage(1)

  }

  const updateSubtask = (index, newName, newAssignedUsers) => {
    setSubtasks(subtasks.map((subtask, subtaskIndex) => {
      if (index === subtaskIndex) {
        return { ...subtask, name: newName, assignedUsers: newAssignedUsers };
      }
      return subtask;
    }));
  };

  const getSortLabel = (value) => {
    const option = sortOptions.find(option => option.value === value);
    return option ? option.label : 'Unknown';
  };

  return (
    <MainLayout>
      <div className='my-3 pe-3 d-flex flex-column w-100' style={{ overflowY: 'auto' }}>
        <div>
          <h1>Tasks</h1>
          <Button variant="primary" onClick={handleShow}>+ Add new</Button>
        </div>

        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{modalPage === 1 ? 'Add new task' : 'Add subtasks'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              modalPage === 1 ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter task title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter task description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      min={today}
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <ToggleSwitch onChange={handlePriorityChange} />

                  <Select
                    isMulti
                    options={usersOptions}
                    onChange={handleSelectChange}
                    value={selectedUsers}
                    className="mb-3"
                    placeholder="No users assigned"
                    components={{ Option: CustomOption }}
                  />


                </Form>
              ) : (

                <div>
                  <div className='d-flex gap-2 mb-3'>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        placeholder="Enter subtask name"
                      />
                    </Form.Group>
                    <Button onClick={addSubtask}>Add subtask</Button>
                  </div>
                  <ol className='subtask-list-add d-flex gap-2 flex-column pe-2'>
                    {subtasks.map((subtask, index) => (
                      <SubtaskItem
                        key={index}
                        subtask={subtask}
                        index={index}
                        updateSubtask={updateSubtask}
                        removeSubtask={removeSubtask}
                        selectedUsers={selectedUsers}
                      />
                    ))}
                  </ol>
                </div>
              )
            }

          </Modal.Body>
          <Modal.Footer>
            {modalPage === 1 ? (
              <>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={goToNextPage}>
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={goBackToFirstPage}>
                  Go Back
                </Button>
                <Button variant="success" onClick={handleSaveTask}>
                  Save
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>

        <div className="divider mb-3 mt-4">
          <span>
            Team tasks
          </span>
        </div>
        {tasks.length > 1 && (
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-team">
              {getSortLabel(sortOptionTeam)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sortOptions.map(option => (
                <Dropdown.Item key={option.value} onClick={() => setSortOptionTeam(option.value)}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <div className='d-flex flex-column'>
          {sortTasks(tasks, sortOptionTeam).map((task, index) => {
            if (!isTeamTasksExpanded && index > 0) return null;

            return <TaskItem key={task.id} task={task} teamId={teamId} />;
          })}
        </div>
        {tasks.length > 1 && (
          <div onClick={toggleTeamTasks} className='show-less-more'>
            {isTeamTasksExpanded ? <><ArrowUpIcon /> Show less </> : <> <ArrowDownIcon />Show more</>}
          </div>
        )}

        <div className="divider mb-3 mt-5">
          <span>
            Your tasks
          </span>
        </div>
        {userTasks.length > 1 && (
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-team">
              {getSortLabel(sortOptionYour)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sortOptions.map(option => (
                <Dropdown.Item key={option.value} onClick={() => setSortOptionYour(option.value)}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <div className='d-flex flex-column'>
          {userTasks.length < 1 && (
            <span className="lack-of-data mt-3">
              No tasks assigned
            </span>)}
          {sortTasks(userTasks, sortOptionYour).map((task, index) => {
            if (!isUserTasksExpanded && index > 0) return null;

            return <TaskItem key={task.id} task={task} teamId={teamId} />;
          })}

        </div>
        {userTasks.length > 1 && (
          <div onClick={toggleUserTasks} className='show-less-more'>
            {isUserTasksExpanded ? <><ArrowUpIcon /> Show less </> : <> <ArrowDownIcon />Show more</>}
          </div>
        )}


        <div className="divider mb-3 mt-5">
          <span>
            Pinned tasks
          </span>
        </div>
        {pinnedTasks.length > 1 && (
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-team">
              {getSortLabel(sortOptionPinned)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sortOptions.map(option => (
                <Dropdown.Item key={option.value} onClick={() => setSortOptionPinned(option.value)}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <div className='d-flex flex-column'>
          {pinnedTasks.length < 1 && (
            <span className="lack-of-data mt-3">
              No pinned tasks
            </span>
          )}

          {sortTasks(pinnedTasks, sortOptionPinned).map((task, index) => {
            if (!isPinnedTasksExpanded && index > 0) return null;

            return <TaskItem key={task.id} task={task} teamId={teamId} />;
          })}
        </div>
        {pinnedTasks.length > 1 && (
          <div onClick={togglePinnedTasks} className='show-less-more'>
            {isPinnedTasksExpanded ? <><ArrowUpIcon /> Show less </> : <> <ArrowDownIcon />Show more</>}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
