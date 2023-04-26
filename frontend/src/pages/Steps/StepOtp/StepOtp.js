import React,{useState} from 'react'
import Card from '../../../components/shared/Card/Card'
import TextInput from '../../../components/shared/TextInput/TextInput'
import Button from '../../../components/shared/Button/Button'
import styles from './StepOtp.module.css'
import { verifyOtp } from '../../../http'
import { useDispatch, useSelector } from 'react-redux'
import { setAuth } from '../../../store/authSlice'

function StepOtp({onNext}) {
  const [otp, setOtp] = useState('');
  const dispatch=useDispatch();
  const {phone ,hash}=useSelector((state)=>state.auth.otp)//we need otp from auth slice from the reducer
  async function submit(){

    try{
    const {data}=await verifyOtp({otp,phone,hash})
    console.log(data)
    dispatch(setAuth(data))
    // onNext() //Here we don't needed the on next because when the value changed on the store it reflects
    
    }catch(err){
      console.log(err)
    }
    
  }


  return (
    <>
<div className={styles.cardWrapper}>

<Card title="Enter the code we just texted you" icon="lock-emoji">
        <TextInput value={otp} onChange={(e)=>setOtp(e.target.value)}/>
   <div className={styles.actionButtonWrap}>
    <Button text="Next" onClick={submit} icon="arrow-forward"/>
    
   </div>
   <p className={styles.bottomParagraph}>
    By entering your Otp, you’re agreeing to our Terms of Service and Privacy Policy. Thanks! 
    </p>
      </Card>
 
      </div>
    </>
  )
}

export default StepOtp
