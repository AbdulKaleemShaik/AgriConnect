import React from 'react'
import './AppDowload.css'
import { assets } from "../../../assets/assets"
const AppDowload = () => {
  return (
    <div className='app-dowload' id='app-dowload'>
      <p>For Better Experience Dowload <br /> BiteBunny App </p>
      <div className="app-dowload-plateforms">
        <img src={assets.play_store} alt="" />
        <img src={assets.app_store} alt="" />
      </div>

    </div>
  )
}

export default AppDowload
