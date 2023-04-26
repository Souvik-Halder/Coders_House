import React,{useState} from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '../StepPhoneEmail.module.css'

function Email({onNext}) {
    const [email, setemail] = useState('');

  return (
    
    <Card title="Enter Your Email Id" icon="email-emoji">
<TextInput value={email} onChange={(e)=>setemail(e.target.value)}/>
   
<div className={styles.actionButtonWrap}>
    <Button text="Next" onClick={onNext} icon="arrow-forward"/>
    
   </div>
   <p className={styles.bottomParagraph}>
    By entering your Email Id, you’re agreeing to our Terms of Service and Privacy Policy. Thanks! 
    </p>
      </Card>
 
  )
}

export default Email
