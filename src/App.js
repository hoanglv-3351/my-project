import React from 'react';
import Header from './components/Header/Header';
import PostItem from './components/PostItem/PostItem';
import { useState, useEffect } from "react";
import { db } from './firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

import './App.css';

function App() {
  const [posts, setPosts] = useState([]);

  const getData = async () => {
    const postsCol = collection(db, 'posts');
    const snapshot = await getDocs(postsCol);
    setPosts(
      snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      }))
    )
  }

  //useEffect -> Runs a piece of code based on a specific condition.
	useEffect(() => {
		// this is where the code runs
    getData();
	},[]);
  return (
    <div className="App">
      <Header />
        {/* CSS */}
        {/* https://boxicons.com/usage#import-css */}

      {/* <PostItem /> */}
      <div className="Post__list">
        {
					posts.map(({id, post}) => (
						<PostItem key={id} data={post}/>
			  		))
				}
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
