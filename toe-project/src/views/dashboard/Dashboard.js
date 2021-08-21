import React, { lazy } from 'react'
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCardHeader
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
  CCol,
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


class Dashboard extends React.Component{
constructor(props){
  super(props);
  this.onChangeYear=this.onChangeYear.bind(this);
  this.onChangeAirT=this.onChangeAirT.bind(this);
  this.onChangeBaro1=this.onChangeBaro1.bind(this);
  this.onChangeSeaT=this.onChangeSeaT.bind(this);
  this.onChangeSalSh=this.onChangeSalSh.bind(this);
  this.onChangeHumid=this.onChangeHumid.bind(this);
  this.onChangeRain=this.onChangeRain.bind(this);

    this.state={
      show:'block',
      chartshow:'none',
      year:'',
      airT:'',
      baro1:'',
      SeaT:'',
      SalSh:'',
      humid:'',
      rainamt:''


    }
  
}
onChangeYear(e){
  this.setState({year:e.target.value})
}
onChangeAirT(e){
  this.setState({airT:e.target.value})
}
onChangeBaro1(e){
  this.setState({baro1:e.target.value})
}
onChangeSeaT(e){
  this.setState({SeaT:e.target.value})
}
onChangeSalSh(e){
  this.setState({SalSh:e.target.value})
}
onChangeHumid(e){
  this.setState({humid:e.target.value})
}
onChangeRain(e){
  this.setState({rainamt:e.target.value})
}
handleSubmit(e){
  e.preventDefault()
  this.setState({
      year:'',
      airT:'',
      baro1:'',
      SeaT:'',
      SalSh:'',
      humid:'',
      rainamt:''
    })
  
}

handleChange=event=>{
  event.preventDefault();
  this.setState(({show})=>({
    show:'none'
  }))
  this.setState(({chartshow})=>({
    chartshow:'block'
  }))

}

componentDidMount() {
  this.chartData = JSON.parse(localStorage.getItem('chartdata'));
console.log(this.chartData.year);
  if (localStorage.getItem('chartdata')) {
      this.setState({
          year: this.chartData.year,
          airT: this.chartData.airT,
          baro1: this.chartData.baro1,
          SeaT:this.chartData.SeaT,
          SalSh:this.chartData.SalSh,
          humid:this.chartData.humid,
          rainamt:this.chartData.rainamt
      })
  } else {
      this.setState({
        year:'',
        airT:'',
        baro1:'',
        SeaT:'',
        SalSh:'',
        humid:'',
        rainamt:''
      })
  }
}

componentWillUpdate(nextProps, nextState) {
  
  localStorage.setItem('chartdata', JSON.stringify(nextState));
}


render(){
  
const chartyear=Number(this.state.year); 
const chartairT=Number(this.state.airT);
const chartbaro1=Number(this.state.baro1);
const chartseaT=Number(this.state.SeaT);
const chartsalsh=Number(this.state.SalSh);
const charthumid=Number(this.state.humid);
const chartrainAmt=Number(this.state.rainamt);
const Catch=((-14.942*chartyear)+(1.113+chartairT)+(0.065*chartbaro1)
-(0.118*chartseaT)+(0.255*chartsalsh)
-(0.060*charthumid)-(4.018*chartrainAmt)+30002.567);
console.log(Catch);
  return (
    <>
    <CRow style={{display:this.state.show}}>
      <CCol>
        <CCard>
          <CCardHeader>
            Catch Prediction Analysis
            <DocsLink name="-Input"/>
          </CCardHeader>
          <CCardBody>
          <CForm>
            <CRow>
              <CCol xs="12">
                <CFormGroup>
                  <CLabel htmlFor="year">Year</CLabel>
                  <CInput id='year' value={this.state.year} onChange={this.onChangeYear} placeholder="Enter the year" required />
                </CFormGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12">
                <CFormGroup>
                  <CLabel htmlFor="airT">AirT</CLabel>
                  <CInput id="airT" value={this.state.airT} onChange={this.onChangeAirT} placeholder="Enter Atmospheric Temperature" required />
                </CFormGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12">
                <CFormGroup>
                  <CLabel htmlFor="baro1">Baro1</CLabel>
                  <CInput id="baro1" value={this.state.baro1} onChange={this.onChangeBaro1} placeholder="Enter Barometric Pressure" required />
                </CFormGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12">
                <CFormGroup>
                  <CLabel htmlFor="SeaT">SeaT</CLabel>
                  <CInput id="SeaT"  value={this.state.SeaT} onChange={this.onChangeSeaT}  placeholder="Enter Sea Temperature" required />
                </CFormGroup>

                <CFormGroup>
                  <CLabel htmlFor="SalSh">SalSh</CLabel>
                  <CInput id="SalSh" value={this.state.SalSh} onChange={this.onChangeSalSh} placeholder="Enter Salinity" required />
                </CFormGroup>

                <CFormGroup>
                  <CLabel htmlFor="Humid">Humidity</CLabel>
                  <CInput id="humid" value={this.state.humid} onChange={this.onChangeHumid} placeholder="Enter Humidity" required />
                </CFormGroup>
                <CFormGroup>
                  <CLabel htmlFor="rainamt">Rain Amount</CLabel>
                  <CInput id="rainamt" value={this.state.rainamt} onChange={this.onChangeRain} placeholder="Enter Rain Amount" required />
                </CFormGroup>
                <CFormGroup>
                <CCol xs="12" lg="12">
                <CButton className="btn-youtube mb-1" type="button" onClick={this.handleChange} block><span>Calculate</span></CButton>
              </CCol>
              </CFormGroup>
              
              </CCol>
            </CRow>
            </CForm>
         </CCardBody>
        </CCard>
      </CCol>
      
    </CRow>
    
    <CCardGroup style={{display:this.state.chartshow}} columns className = "cols-2" >
      <CCard>
        <CCardHeader>
          Bar Chart
          <DocsLink href="http://www.chartjs.org"/>
        </CCardHeader>
        <CCardBody>
          <CChartBar
            datasets={[
              {
                label: 'Bar Chart Prediction',
                backgroundColor: '#f87979',
                data: [(Catch/5),(Catch/5),(Catch/5),(Catch/5),(Catch/5)]
              }
            ]}
            labels="months"
            options={{
              tooltips: {
                enabled: true
              }
            }}
          />
        </CCardBody>
      </CCard>

      {/*<CCard>
        <CCardHeader>
          Doughnut Chart
        </CCardHeader>
        <CCardBody>
          <CChartDoughnut
            datasets={[
              {
                backgroundColor: [
                  '#41B883',
                  '#E46651',
                  '#00D8FF',
                  '#DD1B16'
                ],
                data: [40, 20, 80, 10]
              }
            ]}
            labels={['VueJs', 'EmberJs', 'ReactJs', 'AngularJs']}
            options={{
              tooltips: {
                enabled: true
              }
            }}
          />
        </CCardBody>
          </CCard>*/}

      <CCard>
        <CCardHeader>
          Line Chart
        </CCardHeader>
        <CCardBody>
          <CChartLine
            datasets={[
              {
                label: 'Data One',
                backgroundColor: 'rgb(228,102,81,0.9)',
                data: [Catch]
              },
              // {
              //   label: 'Data Two',
              //   backgroundColor: 'rgb(0,216,255,0.9)',
              //   data: [39, 80, 40, 35, 40, 20, 45]
              // }
            ]}
            options={{
              tooltips: {
                enabled: true
              }
            }}
            labels="months"
          />
        </CCardBody>
      </CCard>

     {/* <CCard>
        <CCardHeader>
          Pie Chart
        </CCardHeader>
        <CCardBody>
          <CChartPie
            datasets={[
              {
                backgroundColor: [
                  '#41B883',
                  '#E46651',
                  '#00D8FF',
                  '#DD1B16'
                ],
                data: [40, 20, 80, 10]
              }
            ]}
            labels={['VueJs', 'EmberJs', 'ReactJs', 'AngularJs']}
            options={{
              tooltips: {
                enabled: true
              }
            }}
          />
        </CCardBody>
          </CCard>*/}

      {/*<CCard>
        <CCardHeader>
          Polar Area Chart
        </CCardHeader>
        <CCardBody>
          <CChartPolarArea
            datasets={[
              {
                label: 'My First dataset',
                backgroundColor: 'rgba(179,181,198,0.2)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: 'rgba(179,181,198,1)',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: [65, 59, 90, 81, 56, 55, 40]
              },
              {
                label: 'My Second dataset',
                backgroundColor: 'rgba(255,99,132,0.2)',
                pointBackgroundColor: 'rgba(255,99,132,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: 'rgba(255,99,132,1)',
                pointHoverBorderColor: 'rgba(255,99,132,1)',
                data: [28, 48, 40, 19, 96, 27, 100]
              }
            ]}
            options={{
              aspectRatio: 1.5,
              tooltips: {
                enabled: true
              }
            }}
            labels={[
              'Eating', 'Drinking', 'Sleeping', 'Designing',
              'Coding', 'Cycling', 'Running'
            ]}
          />
        </CCardBody>
          </CCard>*/}

     {/* <CCard>
        <CCardHeader>
          Radar Chart
        </CCardHeader>
        <CCardBody>
          <CChartRadar
            datasets={[
              {
                label: '2019',
                backgroundColor: 'rgba(179,181,198,0.2)',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                tooltipLabelColor: 'rgba(179,181,198,1)',
                data: [65, 59, 90, 81, 56, 55, 40]
              },
              {
                label: '2020',
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                pointBackgroundColor: 'rgba(255,99,132,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255,99,132,1)',
                tooltipLabelColor: 'rgba(255,99,132,1)',
                data: [28, 48, 40, 19, 96, 27, 100]
              }
            ]}
            options={{
              aspectRatio: 1.5,
              tooltips: {
                enabled: true
              }
            }}
            labels={[
              'Eating', 'Drinking', 'Sleeping', 'Designing',
              'Coding', 'Cycling', 'Running'
            ]}
          />
        </CCardBody>
          </CCard>*/}
    </CCardGroup>
    </>
  )
}
}
 

export default Dashboard
