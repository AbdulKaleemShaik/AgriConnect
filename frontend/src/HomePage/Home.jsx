import React from 'react'
import NavBar from './NavBar'
import Hero from './Hero'
import AgriConnect from './Agroconnect'
import Working from './Working'
import Farmer from './Farmer'
import Footer from './Fotter'

function Home() {
  return (
    <div>
      <NavBar />
      <Hero />
      <AgriConnect />
      <Working />
      <Farmer />
      <Footer />
    </div>
  )
}

export default Home