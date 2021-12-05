import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router'
import axios from 'axios'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { LoginHandler } from '../redux/modules/IsLogin'
import { UserInfoHandler } from '../redux/modules/UserInfo';
import SearchPassword from '../components/Login/SearchPassword'
import GuestLoginModal from '../components/Login/GuestLoginModal'

export interface loginInfoState {
        email: string,
        password: string
    };

export interface IProps {
    modlaOnOff: any
}

export interface modalOnOffState {
    guestModal:boolean,
    seaerchPasswordModal:boolean
}


   
function Login(){
    const dispatch = useDispatch()
    const history = useHistory()
    if(useSelector((state: RootStateOrAny)=>state.IsLoginReducer.isLogin) === true){
        history.push('/Timeline')
    }
    const [loginInfo, setLoginInfo] = useState<loginInfoState>({
        email: '',
        password:''
    })
    const [modalOnOff, setModalOnOff] = useState<modalOnOffState>({
        guestModal:false,
        seaerchPasswordModal:false
    })

    const [userInfo, setUserInfo] = useState({
        email:'',
        userId: 0,
        nickname: '',
        area: '',
        area2: '',
        manager: false, 
        socialType: ''
    })

    const [errorMessage, setErrorMessage] = useState<string>('')
    const inputHandler = (key:string)=>(e:React.ChangeEvent<HTMLInputElement>) => {
        setLoginInfo({...loginInfo, [key]:e.target.value})
    }
    
    const submitHandler = async (e:React.MouseEvent<HTMLButtonElement>) =>{
        if(loginInfo.email === '' || loginInfo.password === ''){
            setErrorMessage('void')
        }
        e.preventDefault();
        const body = {email:loginInfo.email, password:loginInfo.password }
        try {
            const loginInfoPost = await axios.post(`${process.env.REACT_APP_API_URL}/login`, body, {withCredentials: true})
            setUserInfo(
            {
                email: loginInfo.email,
                userId: loginInfoPost.data.userId,
                nickname: loginInfoPost.data.nickname,
                area: loginInfoPost.data.area || null,
                area2: loginInfoPost.data.area2 || null,
                manager: loginInfoPost.data.manager, 
                socialType: loginInfoPost.data.socialType
            })
            history.push('/Timeline')
        } catch (error:any) {
            if(error.response.status === 401){
                console.log('이메일이나 비밀번호가 맞지 않습니다')
            }
            return ;
        }
        dispatch(LoginHandler(true))
        dispatch(UserInfoHandler(userInfo))
    }
    const loginState = useSelector((state: RootStateOrAny)=>state.IsLoginReducer);
    const loginUserInfo = useSelector((state: RootStateOrAny)=>state.UserInfoReducer);
    console.log(loginState,loginUserInfo)

    

    const guestModalHandler = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setModalOnOff({...modalOnOff,['guestModal']:!modalOnOff.guestModal})
    }

    const passwordSearchModalHandler = function() {
        setModalOnOff({...modalOnOff,['seaerchPasswordModal']:!modalOnOff.seaerchPasswordModal})
    }


    //스테이트 프롭스 전달 관련
    const offSeaerchPasswordModal = () => { 
        setModalOnOff({...modalOnOff,['seaerchPasswordModal']:false})
    };
    const closeSeaerchPasswordModal = function () { 
        offSeaerchPasswordModal()
    };
    const offGuestModalModal = () => { 
        setModalOnOff({...modalOnOff,['guestModal']:false})
    };
    const closeGuestModal = function () { 
        offGuestModalModal()
    };

    return(
        <div>
            {modalOnOff.seaerchPasswordModal ? <SearchPassword closeSeaerchPasswordModal={closeSeaerchPasswordModal} /> : null}
            {modalOnOff.guestModal ? <GuestLoginModal closeGuestModal={closeGuestModal} /> : null}
            <img className='logo_page' src="로고-우동담-Dark-모양만-배경o.png" alt="logo" />
            <form className='submit_box'>
                <div>
                <input type="text" onChange={inputHandler('email')} placeholder='이메일' /> <br />
                <input type="password" onChange={inputHandler('password')} placeholder='비밀번호' /> <br />
                {errorMessage}
                </div>
                <button className='login_button' onClick={submitHandler}>로그인</button>
                <button className='guest_button' onClick={guestModalHandler}>게스트로그인</button>
            </form>
            <div className='userguide_box'>
                    <ul>
                        <li><Link to='/Signup'>회원가입</Link> </li>
                        <li onClick={passwordSearchModalHandler}>비밀번호를 잊으셨나요?</li>
                    </ul>
            </div>
            <div className='social'>소셜로그인 아이콘</div>
        </div>
           
    )
}

export default Login