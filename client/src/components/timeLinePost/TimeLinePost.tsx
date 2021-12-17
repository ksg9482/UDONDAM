/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {useState, useRef} from 'react';
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { Link } from 'react-router-dom'
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { NONAME } from "dns";
import { faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons";

library.add(faCommentDots);
library.add(faArrowAltCircleDown);

const WhyUser = styled.div`
    color: #ff4006;
`;

// {
//     id: 1, //postId
//     nickname: "oh", //유저 닉네
//     content: "그.....", //게시글내
//     tag: ['서울' , '운동' , '식사', '독서'], //태그
//     commentCount: 20, //댓글 
//     likeCount: 10, //따봉 수
//     likeCheck: false,  //따봉 눌렀는지 체
//     createAt: '2020-10-10 09:10',  //생성날
//     public: true  // 1 대 1 채팅 활성화, 비활성화
//    }

function TimeLinePost({postData,userData,addSelectTagSearchHandle,createAtDesign,notGiftTag,giftTag}: any) {
    console.log(postData)
    const likeTrue = {
        color: "blue"
    }
    const boxBorder = {
        border: '1px solid black',
        textDecoration: 'none',
        margin: '1rem'
    }
    
    return (
        <div>
            

            {postData.map((el: { nickname: any,createAt: any ,content:any, tag:any, id:any, commentCount:any, likeCount:any, userId:any, likeCheck:any} , idx:any) => {
        
                return (
                    //여기다 탈퇴한 회원정보 3항 연산자 쓰면 됨
                    <div>
                        <div style={boxBorder}>
                        <Link style={{textDecoration: 'none'}} to={{
                            pathname: `./Content`,
                            state: {
                            ida: el.id,
                            tag: giftTag,
                            notTag: notGiftTag,

                            }
                            
                        }}>
                        <div>
                            {userData.userId === el.userId ? <WhyUser>{`${el.nickname} -글쓴이`}</WhyUser> : <div>{el.nickname}</div>}
                            <div>{createAtDesign(el.createAt)}
                            <span>신고</span>
                        </div>
                        <div>{el.content}</div>
                        {el.tag.map((le: {tag: any}) => {
                            return (<span>#{le} </span>)
                        })
                        }
                        <div>
                            <span>
                                <FontAwesomeIcon icon={faCommentDots} data-fa-transform="flip-v"></FontAwesomeIcon>
                                {el.commentCount}
                            </span>
                            {el.likeCheck ? 
                            <span style={likeTrue}>
                                <FontAwesomeIcon icon={faThumbsUp}></FontAwesomeIcon>
                                {el.likeCount}
                            </span>
                            :
                            <span>
                                <FontAwesomeIcon icon={faThumbsUp}></FontAwesomeIcon>
                                {el.likeCount}
                            </span>
                            }

                        </div>
                        </div>
                        </Link>
                        
                        </div>
                        <div>{postData.length === idx+1 ? <button onClick={addSelectTagSearchHandle}>
                        <FontAwesomeIcon icon={faArrowAltCircleDown}></FontAwesomeIcon>
                        </button>: null}</div>
                    </div>
                )
                
            }
            
            )
            
            }
            
        </div>
    )

}

export default TimeLinePost;