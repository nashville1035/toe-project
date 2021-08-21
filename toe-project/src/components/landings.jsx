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


class Landings extends React.Component{
constructor(){
    super();
    this.state={
        name:'',
        veselid:[],
        hide:'none',
        value:'none',
        value1:'none'
       
    }
    this.handleChange1 = this.handleChange1.bind(this)
    this.handleSubmit1 = this.handleSubmit1.bind(this)
}
handleChange1=(event)=>{
    this.setState({
        value:event.target.value,
        value1:event.target.value1
    })
}
handleSubmit1=(event)=>{
    event.preventDefault();
    this.setState(({hide})=>(
        {
            hide:'show'
        }
    ))
    const {value,value1}=this.state;
    try{
        firestore.collection('vessels').doc(value1).add({year:value1});
    }catch(error){
        alert(error)
    }

}



handleSubmit=(e)=>{
    e.preventDefault();
    const {name}=this.state;
    try{
        firestore.collection('vessels').add({name:name});
        
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
           Manage Landings
            <DocsLink name="-Input"/>
          </CCardHeader>
          <CCardBody>
          <CForm onSubmit={this.handleSubmit}>
          <CCol md="3">
          <CLabel htmlFor="select">Select</CLabel>
        </CCol>
        <CRow>
        <CCol xs="6" >
          <CSelect custom name="select" id="select">
          <option value="none">Vessel</option>
          { 
            this.state.veselid.map((info,idx)=>{
            return(
              
                <option value={info.id}>{info.name}</option>
    
               
            )
        }
        )
    }
   </CSelect>
   </CCol>
   <CCol xs="6" >
    <CSelect custom name="select" id="select">
    <option value1="0">Year</option>
    <option value1="1990">1990</option>
    <option value1="1991">1991</option>
    <option value1="1992">1992</option>
    <option value1="1993">1993</option>
    <option value1="1994">1994</option>
    <option value1="1995">1995</option>
    <option value1="1996">1996</option>
    <option value1="1997">1997</option>
    <option value1="1998">1998</option>
    <option value1="1999">1999</option>
    <option value1="2000">2000</option>
    <option value1="2001">2001</option>
    <option value1="2002">2002</option>
    <option value1="2003">2003</option>
    <option value1="2004">2004</option>
    <option value1="2005">2005</option>
    <option value1="2006">2006</option>
    <option value1="2007">2007</option>
    <option value1="2008">2008</option>
    <option value1="2009">2009</option>
    <option value1="2010">2010</option>
    <option value1="2011">2011</option>
    <option value1="2012">2012</option>
    <option value1="2013">2013</option>
    <option value1="2014">2014</option>
    <option value1="2015">2015</option>
    <option value1="2016">2016</option>
    <option value1="2017">2017</option>
    <option value1="2018">2018</option>
    <option value1="2019">2019</option>
    <option value1="2020">2020</option>
    <option value1="2021">2021</option>
</CSelect>
</CCol>
</CRow> 
            <CRow>
              <CCol xs="6">
                <CFormGroup>
            
                </CFormGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12">
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
    <CCol style={{display:this.state.show}}>
      <CCard>
        <CCardHeader>
         Add Landing for 
          <DocsLink name="-Input"/>
        </CCardHeader>
        <CCardBody>
        <CForm onSubmit={this.handleSubmit}>
          <CRow>
            <CCol xs="6">
              <CFormGroup>
              <CSelect custom name="select" id="select">
              <option value='0'>Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
          </CSelect>
              </CFormGroup>
            </CCol>
          </CRow>
          <CRow>
            <CCol xs="6">
              <CFormGroup>
            
             
                <CSelect custom name="select" id="select">
                <option value="0">Location</option>
                { 
                  this.state.veselid.map((info,idx)=>{
                  return(
                    
                      <option value={info.id}>{info.name}</option>
          
                     
                  )
              }
              )
          }
         </CSelect>
    
              </CFormGroup>
            </CCol>
          </CRow>
          <CRow>
            <CCol xs="6">
              <CFormGroup>
                <CLabel htmlFor="Mass"></CLabel>
                <CInput name="Mass" value={this.state.name} onChange={this.handleOnChange} placeholder="Mass in Kg" required />
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


export default Landings;
