import React, { useState } from "react";
import Button from "@mui/material/Button";

import "./Style-Header.css";

export default function Header(props) {
	const [openModal, setOpenModal] = useState(true);
	const [logOut, setLogOut] = useState(false);
	const [logIn, setLogIn] = useState(false);
	const [addNew, setAddNew] = useState(false);

	const transferMesageSignUp = () => {
		setOpenModal(true);
		props.takeMessSignUp(openModal);
	};

	const transferMessageLogOut = () => {
		setLogOut(true);
		props.takeMessLogOut(logOut)
	}

	const transferMessageLogIn = () => {
		setLogIn(true);
		props.takeMessLogIn(logIn);
	}

	const transferMessageAddNewPost = () => {
		setAddNew(true);
		props.takeMessAddNewPost(addNew);
	}

	return (
		<div className="container">
			<div className="header">
				<div className="header__logo">
					<a href='#'>
						<img
							src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
							alt="Logo"
						/>
					</a>
				</div>
				<div className="header__search">
					<input type="text" placeholder="Tìm kiếm" />
					<i className='bx bx-search-alt-2' ></i>
				</div>
				<div className="header__login">
					{props.user ? (
						<>
							<Button className="btn btn-upload" onClick={transferMessageAddNewPost}>
								<i className='bx bx-message-square-add'></i>
							</Button>
							<Button
								onClick={transferMessageLogOut}
								className="btn btn-login"
							>
								Log out
							</Button>
						</>) : (
						<div>
							<Button
								onClick={transferMessageLogIn}
								className="btn btn-login"
							>
								Sign in
							</Button>
							<Button
								onClick={transferMesageSignUp}
								className="btn btn-sign-up"
							>
								Sign up
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}