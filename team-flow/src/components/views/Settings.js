import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import AvatarLarge from '../common/AvatarLarge';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../contexts/UserContext';
import { Spinner } from 'react-bootstrap';
import { ReactComponent as EditIcon } from '../../assets/edit-pencil.svg'

export default function Settings() {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const { currentUser } = useAuth();
    const { getUserData } = useUser()
    const [user, setUser] = useState();
    const [isEditMode, setIsEditMode] = useState(false);
    const [showInitials, setShowInitials] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef()
    const [uploaded, setUploaded] = useState(false)
    const [fullName, setFullName] = useState('');
    const [tempPreviewUrl, setTempPreviewUrl] = useState('')

    const toggleEditMode = () => {
        if (isEditMode) {
            // Reset the preview URL to the original if canceling edit mode
            setTempPreviewUrl('');
            setUploaded(false);
        }
        setIsEditMode(!isEditMode);
    };

    useEffect(() => {
        if (currentUser.uid) {
            getUserData(currentUser.uid).then(data => {
                setUser(data);
                setFullName(data.fullName); // Set the initial full name
            });
        }

        setTempPreviewUrl(user?.profilePhoto || '');

    }, [currentUser.uid, getUserData, isEditMode, uploaded, user?.profilePhoto]);

    const handleFullNameChange = (e) => {
        setFullName(e.target.value);
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
            setUploaded(true)
        }
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            const updateData = { fullName: fullName }; // Always update fullName

            if (image) {
                const imageRef = storageRef(storage, `profile_images/${currentUser.uid}/${image.name}`);
                await uploadBytes(imageRef, image);
                const url = await getDownloadURL(imageRef);
                updateData.profilePhoto = url; // Update profilePhoto only if a new image is uploaded
            }

            await updateDoc(doc(db, 'users', currentUser.uid), updateData);

            window.location.reload();
        } catch (error) {
            console.error("Error in handleSave:", error);
            setIsLoading(false);
        }
    };


    const handleClearPhoto = () => {
        setTempPreviewUrl(null);
        setShowInitials(true); // Indicate that initials should be shown
    };

    return (
        <MainLayout>
            <div className='d-flex flex-column container py-3'>
                <div className='border-bottom'>
                    <h1 className="mb-2">Settings</h1>
                    <p className="mb-4 subtitle">
                        You can change your profile and application configuration here.
                    </p>
                </div>

                <span className="d-flex align-items-center my-3 edit-btn" onClick={toggleEditMode}>
                    <EditIcon className="me-2" style={{ height: "15px" }} />{isEditMode ? 'Cancel' : 'Edit'}
                </span>

                <div className='d-flex align-items-center justify-content-between'>
                    <div>
                        <h2>User profile</h2>
                    </div>
                </div>

                <div className='d-flex align-items-center mt-4'>
                    <div className="d-flex flex-column">
                        <AvatarLarge userId={currentUser.uid} previewPhoto={tempPreviewUrl || previewUrl} showInitials={showInitials} />
                        {isEditMode && (
                            <>
                                <Form.Group controlId="formFile" className="my-3">
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/png, image/jpeg, image/jpg"
                                    />
                                </Form.Group>
                                <button variant="primary" onClick={() => fileInputRef.current.click()} className={` btn b-dotted ${!uploaded ? 'btn-outline-secondary upload-btn' : 'btn-primary'} `}>
                                    {!uploaded ? 'Upload image' : 'Image uploaded'}
                                </button>
                                <Button variant="danger" onClick={handleClearPhoto} className='mt-2'>Remove photo</Button>
                            </>
                        )}
                    </div>
                </div>
                <Form>
                    <Form.Group id="full-name" className="my-3">
                        <Form.Label className="label-text">Full name</Form.Label>
                        <Form.Control
                            className={`form-control-lg ${!isEditMode ? 'disabled-text' : ''}`}
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={handleFullNameChange}
                            required={true}
                            disabled={isEditMode ? false : true}
                        />
                    </Form.Group>


                    <Form.Group id="email" className="my-3">
                        <Form.Label className="label-text">Work Email</Form.Label>
                        <Form.Control
                            className='form-control-lg disabled-text'
                            type="text"
                            placeholder="Enter your full name"
                            value={user?.email}
                            disabled
                        />
                    </Form.Group>
                    {isEditMode && (<p className="mb-4 subtitle">Email address cannot be changed.</p>)}

                    {isEditMode && (<Button variant="success" onClick={handleSave} disabled={isLoading || fullName.trim().length === 0} className=' my-2 btn-lg'>
                        {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</> : 'Save changes'}
                    </Button>)}
                </Form>

                <div className='border-top mt-4 mb-3'></div>
            </div>
        </MainLayout>
    );
}
