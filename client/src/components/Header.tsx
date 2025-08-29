import assets from "../assets/assets"
import { useAppContext } from "../context/AppContext"

function Header() {

  const {userData} = useAppContext();

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img src={assets.header_img} alt="header-img" className="w-36 h-36 rounder-full mb-6" />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl">Hey {userData ? userData.name : 'Developer'} <img className="w-8 aspect-square" src={assets.hand_wave} alt="hand waving"></img></h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to our app</h2>
      <p>Let's start with a quick product tour and we will have you up and running in no time!</p>
      <button className="text-xl border border-gray-500 rounded-full px-7 py-2 mt-4 hover:bg-amber-300 transition-all">Get Started</button>
    </div>
  )
}

export default Header
