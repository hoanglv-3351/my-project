import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import PostItem from './components/PostItem/PostItem';
import {
	db, auth, createUserWithEmailAndPassword,
	signInWithEmailAndPassword, storage, ref,
	uploadBytesResumable, getDownloadURL
} from './firebaseConfig'
import { collection, addDoc, Timestamp, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@mui/material/Modal";
import { Button, Input } from '@mui/material';
import { updateProfile } from "firebase/auth"
import { v4 } from 'uuid'

import './App.css';

function getModalStyle() {
	const top = 50;
	const left = 50;

	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	};
}

const useStyles = makeStyles((theme) => ({
	paper: {
		position: "absolute",
		width: 400,
		backgroundColor: theme.palette.background.paper,
		border: "2px solid #000",
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
	},
}));

function App() {
	const [posts, setPosts] = useState([]);
	const [openModal, setOpenModal] = useState(false); // Check open modal
	const [openSignInModal, setOpenSignInModal] = useState(false)
	const classes = useStyles();
	const [modalStyle] = React.useState(getModalStyle);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [user, setUser] = useState(null);

	const [openModalUpload, setOpenModalUpload] = useState(false);
	const [image, setImage] = useState(null);
	const [progress, setProgress] = useState(0);
	const [caption, setCaption] = useState("");

	const handleClickSignUp = (childData) => {
		setOpenModal(childData);
	}

	const handleClickSignIn = (childData) => {
		setOpenSignInModal(childData);
	}

	const handleClickAddNewPost = (childData) => {
		setOpenModalUpload(childData);
	};

	const handleUpload = () => {
		const imageRef = ref(storage, `images/${image.name + v4()}`)

		let uploadTask = uploadBytesResumable(imageRef, image, image)

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				//progress function
				setOpenModalUpload(false)
				const progress = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);
				setProgress(progress);
			},
			(error) => {
				//handle Error
				alert(error.message);
			},
			() => {
				//handle when complete
				getDownloadURL(imageRef).then(
					url => {
						//Save link image in db of firebase
						addDoc(collection(db, 'posts'),
							{
								timestamp: Timestamp.now(),
								caption: caption,
								imageUrl: url,
								user_id: user.uid
							})
						setProgress(0);
						setCaption('');
						setImage(null);
					}
				);
			}
		);
	};

	const handleSignIn = (event) => {
		signInWithEmailAndPassword(auth, email, password).then(authUser => {
			return setUsername(authUser.user.displayName);
		}).catch((error) =>
			alert(error.message)
		);
		setOpenSignInModal(false);
	}

	const handleSignUp = (event) => {
		createUserWithEmailAndPassword(auth, email, password)
		.then((authUser) => {
			console.log(authUser)
			const newUser = authUser.user;
			
			// add to table users
			try {
				setDoc(doc(db, "users", newUser.uid), {
					id: newUser.uid,
					nickname: username,
					avatarUrl: ""
				})
			} catch (err) {
				console.log(err);
			}

			alert("Sign up successfully!")
			updateProfile(authUser, {
				displayName: username
			}).then((res) => {
				console.log(res)
			})
			console.log(authUser.user.displayName)
		})
		.catch((error) => {
			console.log(error)
		});
		setOpenModal(false);
	}

	//useEffect -> Runs a piece of code based on a specific condition.
	useEffect(() => {
		// this is where the code runs
		const unsub = onSnapshot(
			collection(db, 'posts'), 
			(snapshot) => {
				let postList = [];
				snapshot.docs.forEach((doc) => {
					postList.push({
						id:doc.id,
						post: doc.data()
					})
				})
				setPosts(postList)
			},
			(error) => {
				console.log(error)
			}
		);
		return () => {
			unsub()
		}
	}, []);

	useEffect(() => {
		const unSubcribe = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				// user has logged in...
				setUser(authUser);
				setUsername(authUser.displayName);

				if (authUser.displayName) {
					//don't update username
				} else {
					// if we just create someone...
					return updateProfile(authUser, {
						displayName: username,
					});
				}
			} else {
				// user has logged out...
				setUser(null);
			}
		});
		return () => {
			// Perform some cleanup actions
			unSubcribe();
		}
	}, [user, username])

	const handleClickLogOut = (childData) => {
		if (childData === true) {
			auth.signOut();
		}
	}

	return (
		<div className="App">
			<Header takeMessSignUp={handleClickSignUp} takeMessLogOut={handleClickLogOut} takeMessLogIn={handleClickSignIn} takeMessAddNewPost={handleClickAddNewPost} user={user} />

			{user ? (
				<div className="Post__list">
					{
						posts.map(({ id, post }) => (
							// nhan id user trong data
							<PostItem key={id} data={post} user={user} postId={id} />
						))
					}
				</div>) : (
					<div className='guest-homepage'>
						
					</div>
				)
			}

			{/* sign up */}
			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<div style={modalStyle} className="popup" className={classes.paper} >
					<form className="form__signup">
						<img className="form__logo"
							src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
							alt="Logo"
						/>
						<div className="form__group">
							<label className="popup-label">User name:</label><br />
							<Input className="form__field" placeholder="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
						</div>
						<div className="form__group">
							<label>Email:</label><br />
							<Input className="form__field" placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="form__group">
							<label>Password:</label><br />
							<Input className="form__field" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<Button className="btn-signup" onClick={handleSignUp}>Sign up</Button>
					</form>
				</div>
			</Modal>

			{/* sign in */}
			<Modal open={openSignInModal} onClose={() => setOpenSignInModal(false)}>
				<div style={modalStyle} className="popup" className={classes.paper} >
					<form className="form__signup">
						<img className="form__logo"
							src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
							alt="Logo"
						/>
						<div className="form__group">
							<label>Email:</label><br />
							<Input className="form__field" placeholder="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="form__group">
							<label>Password:</label><br />
							<Input className="form__field" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<Button className="btn-signup" onClick={handleSignIn}>Sign In</Button>
					</form>
				</div>
			</Modal>

			{/* upload post */}
			<Modal open={openModalUpload} onClose={() => setOpenModalUpload(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="form__signup">
						<img className="form__logo"
							src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
							alt="Logo"
						/>
						<div className="form__group">
							<progress value={progress} max="100" />
						</div>
						<div className="form__group">
							<Input
								className="form__field"
								placeholder="Enter a caption"
								type="text"
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
							/>
						</div>
						<div className="form__group">
							<input
								className="form__field"
								type="file"
								id='photo'
								onChange={(event) => { setImage(event.target.files[0]) }}
							/>
						</div>
						<Button className="btn-signup" onClick={handleUpload}>
							Upload
						</Button>
					</form>
				</div>
			</Modal>

			{/* <Footer /> */}
		</div>
	);
}

export default App;
