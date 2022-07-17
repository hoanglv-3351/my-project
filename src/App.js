import React from 'react';
import Header from './components/Header/Header';
import PostItem from './components/PostItem/PostItem';
import './App.css';
// import PostItem from './components/PostItem/PostItem';

function App() {
  return (
    <div className="App">
      <Header />
        {/* CSS */}
        {/* https://boxicons.com/usage#import-css */}

      {/* <PostItem /> */}
      <div className="Post__list">
        <PostItem />
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
