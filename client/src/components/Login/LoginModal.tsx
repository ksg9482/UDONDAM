import React, { useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { onOffState} from '../../pages/Mypage';
import { IProps } from '../../pages/Mypage';
    //지역인증

    export const ModalContainer = styled.div`
    display:grid;
    justify-items: center;
    //justify-content:center;
    //align-items:center;
    //align-self:center;
    //align-content:center;
    
  `;
  
  export const ModalBackdrop = styled.div`
   position:absolute;
   top:0;
   left:0;
   z-index: 999;
   background-color: rgba(117, 190, 218, 0.3);
   
   width: 100%;
   height: 100%;
   
  `;
  
  
  export const ModalView = styled.div.attrs(props => ({
    role: 'dialog'
  }))`
  
  position:absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding:40px;
  width: 10em;
  height: 10em;
  border-radius: 10px;
  text-align: center;
  border: solid 1px black;
  
  .close-btn{
    position:relative;
    color:red;
    bottom:3rem;
    left:6rem;
  }
  
  & .modal_text{
    position:relative;
    bottom: 3rem;
    font-size:1.5rem;
    line-height:7rem
    
  }
  & .modal_title{
    position:relative;
    bottom:2rem;
  }
  
  & .long{
    position:relative;
    line-height:2.5rem
  }
  
  & .modal_text_password{
    position:relative;
    font-size:2rem;
  }
  
  & .input_password{
    position:relative;
    right:0.5rem;
    height: 18px;
    bottom:1px
  }
  
  
  `;



function LoginModal () {
    const dispatch = useDispatch();
    const history = useHistory();
    const [isOpen, setIsOpen] = useState(true);

    const openModalHandler = () => {
      setIsOpen(!isOpen)
      
    };
    
    return (
        <>
    
          {!isOpen ? null :
            <ModalContainer>
              <ModalBackdrop >
                <ModalView onClick={(e) => e.stopPropagation()}>
    
                  <div>
                    <span className='modal_title'>회원탈퇴 확인</span>
                    <span className="close-btn" >&times;</span>
                  </div>
                  <div className='modal_text'>정말로 회원 탈퇴 하시겠습니까?</div>
                  <div className='modal_text long'>회원탈퇴와 동시에 모든 유저정보가 삭제되며 복구할 수 없습니다</div>
                  <div className='password_submit'>
                  <div className='modal_text_password'>비밀번호 확인</div>
                  <div className='submit_container'>
                   <input className='input_password' type='password' ></input>
                   <button >회원탈퇴</button>
                  </div>
                   
                  </div>
                </ModalView>
              </ModalBackdrop>
            </ModalContainer>
          }
        </>
      );
}

export default LoginModal