import React from 'react';
import {Card, Col, Container, Row, Form, Button} from "react-bootstrap";
import './login.scss';

class Login extends React.Component {

    handleSubmit = (e) => {
        e.preventDefault();
        const form = document.getElementById('login-form');
        let formData = new FormData();
        formData.set('username', form.username.value);
        formData.set('password', form.password.value);

        fetch('http://localhost:8000/login', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.props.history.push('/main');
                } else {
                    alert('Login failed');
                }
            })
    }

    render() {
        return (
            <Container>
                <Row className={"login-container"}>
                    <Col xs={12} md={6}>
                        <h2 className={"mb-5"}>Login</h2>
                        <Card body>
                            <Form className={"login-form"} id={"login-form"} onSubmit={this.handleSubmit} encType="multipart/form-data">
                                <Form.Group className={"mb-3"} controlId="username">
                                    <Form.Label>아이디</Form.Label>
                                    <Form.Control type="text" placeholder="아이디를 입력해주세요."/>
                                </Form.Group>
                                <Form.Group className={"mb-3"} controlId="password">
                                    <Form.Label>비밀번호</Form.Label>
                                    <Form.Control type="password" placeholder="비밀번호를 입력해주세요."/>
                                </Form.Group>
                                <a href={"/register"}>회원가입</a>
                                <Button variant="primary" type={"submit"}>
                                    Submit
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
    ;
}

export default Login;
