import React from 'react';
import {Card, Col, Container, Row, Form, Button} from "react-bootstrap";
import './login.scss';
import Modal from "../components/RegisterModal";
import {getCookie, setCookie} from "../components/cookies/Cookies";
import {Navigate} from "react-router-dom";
import {API_URL} from "../actions/hosts";

class Login extends React.Component {

    constructor(props) {
        super(props);

        getCookie("token") && this.props.history.push("/dashboard");

        this.state = {
            loggedIn: false,
            show: false
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const form = document.getElementById('login-form');
        let formData = new FormData();
        formData.set('username', form.username.value);
        formData.set('password', form.password.value);

        fetch(`http://${API_URL}/api/login`, {
            method: 'POST',
            body: formData,
            headers: {
                "Allow-Control-Allow-Origin": "*"
            }
        })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                if (res.hasOwnProperty('access_token') && res.hasOwnProperty('token_type')) {
                    const jwtToken = res.token_type + " " + res.access_token;
                    setCookie('loginToken', jwtToken);
                    this.setState({
                        loggedIn: true
                    })
                } else {
                    alert('Login failed');
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    handleShow = () => {
        this.setState({
            show: true
        })
    }
    handleClose = () => {
        this.setState({
            show: false
        })
    }

    render() {
        return (
            <Container>
                <Row className={"login-container"}>
                    <Col xs={12} md={6}>
                        <h2 className={"mb-5"}>Login</h2>
                        <Card body>
                            <Form className={"login-form"} id={"login-form"} onSubmit={this.handleSubmit}
                                  encType="multipart/form-data">
                                <Form.Group className={"mb-3"} controlId="username">
                                    <Form.Label>아이디</Form.Label>
                                    <Form.Control type="text" placeholder="아이디를 입력해주세요."/>
                                </Form.Group>
                                <Form.Group className={"mb-3"} controlId="password">
                                    <Form.Label>비밀번호</Form.Label>
                                    <Form.Control type="password" placeholder="비밀번호를 입력해주세요."/>
                                </Form.Group>
                                <Button onClick={this.handleShow}>회원가입</Button>
                                <Button variant="primary" type={"submit"}>
                                    Submit
                                </Button>
                            </Form>
                        </Card>

                        <Modal show={this.state.show} handleClose={this.handleClose}/>
                    </Col>
                </Row>
                {
                    this.state.loggedIn && (
                        <Navigate to="/dashboard" replace={true} />
                    )
                }
            </Container>
        );
    }
    ;
}

export default Login;
