import React from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { auth,signInWithGoogle } from 'src/firebase/firebase.utils';

class Login extends React.Component{

  constructor(props){
    super(props);
    this.state={
      email:'',
      password:'',
    }
  }
  handleSubmit=async event=>{
    event.preventDefault();
    const{email,password}=this.state;
    try{
        await auth.signInWithEmailAndPassword(email,password);
        this.setState({email:'',password:''});
    }catch(error){
        alert(error);
    }
}
handleChange=event=>{
    const{value,name}=event.target;
    this.setState({[name]:value});
   
}

  render(){
  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={this.handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput type="email" name="email" placeholder="Email" onChange={this.handleChange} value={this.state.email} autoComplete="email" required />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-lock-locked" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput type="password" name="password" placeholder="Password" onChange={this.handleChange} value={this.state.password} autoComplete="current-password" required />
                    </CInputGroup>
                    <CRow>
                      <CCol xs="4">
                        <CButton color="secondary" type="submit" value="Submit Form" className="px-4">Login</CButton>
                      </CCol>
                      {/* <CCol xs="6">
                        <CButton color="secondary" className="px-4"></CButton>
                      </CCol> */}
                      <CCol xs="6" className="text-right">
                        <CButton color="link" className="px-0">Forgot password?</CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
                <CCardFooter className="p-4">
                <CRow>
                  <CCol xs="12" lg="12">
                    <CButton className="btn-youtube mb-1" onClick={signInWithGoogle} block><span>Sign in with Google</span></CButton>
                  </CCol>
                
                </CRow>
              </CCardFooter>
              </CCard>
              <CCard className="text-white bg-dark py-5 d-md-down-none" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>Register Now!</CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
}
export default Login;
