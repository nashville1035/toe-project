import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {auth, createUserProfileDocument } from 'src/firebase/firebase.utils'

class Register extends React.Component{
  constructor(){
    super();
    this.state={
        displayName:'',
        email:'',
        password:'',
        confirmPassword:''
    }
}
    handleSubmit=async event=>{
        event.preventDefault();
        const{displayName,email,password,confirmPassword}=this.state;

        if(password!==confirmPassword){
            alert("Passwords don't match");
            return;
        }
        try{
            const{user}=await auth.createUserWithEmailAndPassword(email,password);
            createUserProfileDocument(user,{displayName});
            this.setState({
                displayName:'',
                email:'',
                password:'',
                confirmPassword:''
            });
        }catch(error){
            alert(error);

        }
    }
    handleChange=event=>{
        const{name,value}=event.target;
        this.setState({[name]:value});
    }


  render(){
    const{displayName,email,password,confirmPassword}=this.state;
  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="9" lg="7" xl="6">
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={this.handleSubmit}>
                  <h1>Register</h1>
                  <p className="text-muted">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupPrepend>
                      <CInputGroupText>
                        <CIcon name="cil-user" />
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput type="text" onChange={this.handleChange} value={displayName} name="displayName" placeholder="Display Name" autoComplete="Display Name" required />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupPrepend>
                      <CInputGroupText>@</CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput type="email" onChange={this.handleChange} value={email} name="email" placeholder="Email" autoComplete="email" required />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupPrepend>
                      <CInputGroupText>
                        <CIcon name="cil-lock-locked" />
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput type="password" name='password' onChange={this.handleChange} value={password} placeholder="Password" autoComplete="new-password" required />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupPrepend>
                      <CInputGroupText>
                        <CIcon name="cil-lock-locked" />
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput type="password" name='confirmPassword' onChange={this.handleChange} value={confirmPassword} placeholder="Confirm password" autoComplete="new-password" required />
                  </CInputGroup>
                  <CButton color="success" type="submit" block>Create Account</CButton>
                </CForm>
              </CCardBody>
              {/*<CCardFooter className="p-4">
                <CRow>
                  <CCol xs="12" sm="6">
                    <CButton className="btn-facebook mb-1" block><span>facebook</span></CButton>
                  </CCol>
                  <CCol xs="12" sm="6">
                    <CButton className="btn-twitter mb-1" block><span>twitter</span></CButton>
                  </CCol>
                </CRow>
  </CCardFooter> */}
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
}
export default Register
