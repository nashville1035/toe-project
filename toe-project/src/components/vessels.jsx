import React, { lazy } from 'react'
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCardHeader,
  CBadge,
  CCol,
  
} from '@coreui/react'
import {
  CChartBar,
  CChartLine,
  CChartDoughnut,
  CChartRadar,
  CChartPie,
  CChartPolarArea

} from '@coreui/react-chartjs'
import {
  CButton,
  CCardFooter,

  CDataTable,
  CCollapse,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFade,
  CForm,
  CFormGroup,
  CFormText,
  CValidFeedback,
  CInvalidFeedback,
  CTextarea,
  CInput,
  CInputFile,
  CInputCheckbox,
  CInputRadio,
  CInputGroup,
  CInputGroupAppend,
  CInputGroupPrepend,
  CDropdown,
  CInputGroupText,
  CLabel,
  CSelect,
  CRow,
  CSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { DocsLink } from 'src/reusable'
import { firestore } from 'src/firebase/firebase.utils'


class Vessels extends React.Component{
constructor(){
    super();
    this.state={
        name:'',
        veselid:[]
    }
}
handleSubmit=(e)=>{
    e.preventDefault();
    const {name}=this.state;
    try{
        firestore.collection('vessels').collection(name);
        
        this.setState({name:''});
        alert()
    }catch(error){
        alert(error);
    }

}
handleOnChange=(e)=>{
    const {value,name}=e.target;
    this.setState({[name]:value});

}

componentDidMount(){
    console.log('mounted');
    firestore.collection('vessels').get().then((snapshot)=>{
        const veselid=[];
        snapshot.docs.forEach(doc => {
            const dataid=doc.id
            const data=doc.data()
            veselid.push({name:data.name,id:dataid}) 

        })
         this.setState({veselid})
    }).catch(error=>console.log(error));

}


render(){
    const deletedoc=(id)=>{
        firestore.collection('vessels').doc(id).delete()
        .then(()=>alert('Deleted Recored Sucessfully'))
        .catch(()=>alert('Something went wrong'))
    }

    
  return (
      
    <>
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
           Add Vessels
            <DocsLink name="-Input"/>
          </CCardHeader>
          <CCardBody>
          <CForm onSubmit={this.handleSubmit}>
            <CRow>
              <CCol xs="6">
                <CFormGroup>
                  <CLabel htmlFor="name"></CLabel>
                  <CInput name="name" value={this.state.name} onChange={this.handleOnChange} placeholder="Name" required />
                </CFormGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="6">
                <CFormGroup>
                <CCol xs="12" lg="12">
                <CButton className="btn-facebook mb-1" type="submit" block><span>Add</span></CButton>
              </CCol>
              </CFormGroup>

              </CCol>
            </CRow>
            </CForm>
         </CCardBody>
        </CCard>
      </CCol>
      
    </CRow>
   
    <CRow>
    <CCol>
      <CCard>
        <CCardHeader>
          List of Vessels
        </CCardHeader>
        <CCardBody>
        <table className="table table-striped table-bordered table-sm">
        <thead>
        <tr>
        <th>Name</th>
        <th>Remove</th>
        </tr>
        </thead>
        <tbody>
       
       { 
        this.state.veselid.map((info,idx)=>{
        return(
            <tr>
            <td>{info.name}</td>
            <td><button onClick={()=>{deletedoc(info.id)}}>Remove from list</button></td>
            </tr>
        )
    }
    )
}
  
        </tbody>
        </table>
        <tbody>
     
        </tbody>
    
        
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
     </>
  )
}
}


export default Vessels;
