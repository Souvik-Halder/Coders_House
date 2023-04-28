
import React, { useEffect, useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import Button from '../../../components/shared/Button/Button'
import styles from './StepAvatar.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { setAvatar } from '../../../store/activateSlice'
import { activate } from '../../../http/index'
import { setAuth } from '../../../store/authSlice'
import Loader from '../../../components/shared/Loader/Loader'

function StepAvatar({ onNext }) {

  const { name, avatar } = useSelector(state => state.activate);
  const dispatch = useDispatch();
  const [image, setImage] = useState('/images/monkey-avatar.png');
  const [loading, setLoading] = useState(false);
  const [unmounted, setUnmounted] = useState(false);


  async function submit() {
    if (!name || !avatar) return;
    try {
      setLoading(true)
      const { data } = await activate({ name, avatar })
      if (data.auth) {
        //check
        if (!unmounted) {
          dispatch(setAuth(data));

        }
      }
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //if we use any event listener we need to remove it
    return () => {
      setUnmounted(true);
    }
  })

  function captureImage(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setImage(reader.result)//fetching the base 64 url

      dispatch(setAvatar(reader.result))//after setting the base 64 url string it automatically sets the photo to display
    }
    console.log(e)
  }
  return (
    loading ? <Loader message="Activation in progress...." /> : (
      <>
        <Card title={`Okay, ${name}`} icon="monkey-emoji">
          <p className={styles.subHeading}>How’s this photo?</p>
          <div className={styles.avatarWrapper}>
            <img
              className={styles.avatarImage}
              alt="avatar"
              src={image}
            />
          </div>
          <div>
            <input
              onChange={captureImage}
              className={styles.avatarInput}
              id="avatarInput"
              type="file"

            />
            <label className={styles.avatarLabel} htmlFor="avatarInput">
              Choose a different photo
            </label>
          </div>
          <div>
            <Button onClick={submit} text="Next" icon="arrow-forward" />
          </div>
        </Card>
      </>
    )
  )
}

export default StepAvatar
