export class EmailTemplate {
    email: string;
    verificationCode: string;
    from: string;
    subject: string;
    html: string;

    constructor(email: string, verificationCode: string) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.from = `[UDONDAM] <${process.env.NODEMAILER_USER}>`;
        this.subject = ``;
        this.html = ``
    }
//getTemplate
    get getTemplate() {
        return {
            from: this.from,
            to: this.email,
            subject: this.subject,
            html: this.html,
        }
    }
}
export class AuthEmail extends EmailTemplate {
    constructor(email:string, verificationCode: string){
        super(email, verificationCode);
        this.subject = `[UDONDAM] 임시 비밀번호를 확인해주세요`;
        this.html =  `<div style="background-color: white;
        display: flex; align-items: center; text-align: center;
        flex-direction:column; font-size: 20px;">
        <div style="background-size: 58px;
        background-color: black;
        width: 50rem; min-height: 45rem;
        border-radius: 15px 15px 15px 15px;
        padding: 2rem;">
        <img width="300" alt="로고-우동담-dark-배경o" src="https://user-images.githubusercontent.com/87490361/143793727-047f5764-454d-4b9f-94cd-d82d0f959623.png">
        <div style="text-align: left; padding:10px 10px 0;">
        <h3 style="text-align: left; color:white;">로그인을 하시려면 비밀번호 란에 <b>임시 비밀번호</b>를 입력해주세요.</h3>
        <h3 style="color:white;">기존 비밀번호가 아닌 발급드린 임시 비밀번호를 입력하셔야만 로그인이 됩니다.</h3>
        <h3 style="color:white;">UDONDAM 임시 비밀번호 : <u>${verificationCode}</u></h3>
        </div></div></div>`
    }
};

export class TempPasswordEmail extends EmailTemplate {
    constructor(email:string, verificationCode: string){
        super(email, verificationCode);
        this.subject = `[UDONDAM] 이메일 인증번호를 확인해주세요`;
        this.html =  `<div style="background-color: white;
        display: flex; align-items: center; text-align: center;
        flex-direction:column; font-size: 20px;">
        <div style="background-size: 58px;
        background-color: black;
        width: 50rem; min-height: 45rem;
        border-radius: 15px 15px 15px 15px;
        padding: 2rem;">
        <img width="300" alt="로고-우동담-dark-배경o" src="https://user-images.githubusercontent.com/87490361/143793727-047f5764-454d-4b9f-94cd-d82d0f959623.png">
        <div style="text-align: left; padding:10px 10px 0;">
        <h3 style="text-align: left; color:white;">이메일 인증을 완료하시려면 <b>인증번호</b>를 입력해주세요.</h3>
        <h3 style="color:white;">인증번호를 입력하셔야만 이메일 인증이 완료됩니다.</h3>
        <h3 style="color:white;">UDONDAM 인증번호 : <u>${verificationCode}</u></h3>
        </div></div></div>`
    }
};