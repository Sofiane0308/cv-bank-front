import './App.css';
import { Button, Card, Row, Form, Col, Tabs, Tab, Table, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';

const backendURL = "http://localhost:8080/";

// 2 tabs for uploading and querying
class App extends Component {

  render() {

    return (
      <div className="App">
        <Tabs defaultActiveKey="upload" id="uncontrolled-tab-example" >
          <Tab eventKey="upload" title="Upload">
            <Upload />
          </Tab>
          <Tab eventKey="query" title="Query">
            <Query />
          </Tab>
        </Tabs>
      </div>);
  }

}


//The upload tab
class Upload extends Component {

  state = {
    selectedFiles: [],
    loading: false,
    uploadSuccess: null,
  };

  // On file select (from the pop up) 
  onFileChange = event => {
    console.log(event.target.files);
    // Update the state 
    this.setState({ selectedFiles: event.target.files, uploadSuccess: false });

  };

  // On file upload (click the upload button) 
  onFileUpload = () => {

    // Create an object of formData 
    const formData = new FormData();

    // Update the formData object

    for (let i = 0; i < this.state.selectedFiles.length; i++) {
      formData.append(
        "files",
        this.state.selectedFiles[i],
        this.state.selectedFiles[i].name
      );
    }


    // Request made to the backend api 
    // Send formData object 
    let config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
      }
    }

    this.setState({ loading: true});

    var self = this;
    axios.post(backendURL, formData, config)
      .then(function (response) {
        self.setState({ uploadSuccess: true, loading:false });
      })
      .catch(function (error) {
        console.log(error);
        self.setState({ uploadSuccess: false, loading:false });
      });
  };

  render() {

    let label;
    if (this.state.selectedFiles.length) { label = "CV(s) selected click on the Upload button!" } else { label = "Select CV(s) to upload" }

    let uploadAlert;
    if (this.state.uploadSuccess) {
      uploadAlert = <Alert variant="success">
        CV(s) uploaded successfully !
  </Alert>
    }

    return <Card>
      <Card.Body>
        <Form.File
          id="upload-cv"
          label={label}
          accept=".docx,.pdf"
          onChange={this.onFileChange}
          multiple
          custom
        />

        <hr />
        <Button disabled={this.state.loading}
          onClick={!this.state.loading ? this.onFileUpload : null}>
          
          {this.state.loading ? 'Uploading...' : 'Upload'}
        </Button>
        <hr />
        {uploadAlert}

      </Card.Body>
    </Card>;
  }

}


//The query tab
class Query extends Component {

  state = {
    keyWords: [""],
    result: []
  }

  addKeyWord() {
    this.setState({ keyWords: [...this.state.keyWords, ""] });
  }


  handleChange(e, index) {
    this.state.keyWords[index] = e.target.value;
    this.setState({ keyWords: this.state.keyWords })
  }

  handleRemove(index) {
    this.state.keyWords.splice(index, 1);
    this.setState({ keyWords: this.state.keyWords })
  }

  handleSubmit(e) {
    var self = this;
    axios.get(backendURL + "findByBody/", {
      params: {
        body: this.state.keyWords.toString()
      }
    })
      .then(function (response) {
        self.setState({ result: response.data });
      })
      .catch(function (error) {
        console.log(error);
      });
  }




  render() {

    let resultView;
    if (this.state.result.length) resultView = <Card>
      <Card.Body>
        <Card.Title>
          Matching CVs
        </Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>CV</th>
            </tr>
          </thead>
          <tbody>
            {this.state.result.map((article, index) => <tr><td>{index}</td>  <td> {article} </td></tr>)}
          </tbody>
        </Table>
      </Card.Body>
    </Card>

    return <Card>
      <Card.Body>
        <Card.Title>
          Key words {'  '}
          <Button variant="success" onClick={(e) => this.addKeyWord(e)}> +  </Button>
        </Card.Title>


        {
          this.state.keyWords.map((keyWord, index) => {
            return (
              <Form.Group as={Row} >
                <Form.Label column sm="2">
                  Key word:
                </Form.Label>
                <Col sm="2">
                  <Form.Control type="text" value={keyWord} onChange={(e) => this.handleChange(e, index)} />
                </Col>

                <Button variant="danger" onClick={() => this.handleRemove(index)}> -  </Button>

              </Form.Group>)
          })
        }

        <hr />

        <Button onClick={(e) => this.handleSubmit(e)}> Submit  </Button>
        <hr />
        {resultView}


      </Card.Body>
    </Card>
      ;
  }
}

export default App;
