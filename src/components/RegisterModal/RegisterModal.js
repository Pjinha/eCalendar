import React, {Component} from 'react'
import {Modal, Button, Form, Row, Col} from 'react-bootstrap';
import * as yup from 'yup';
import '../EventModal/EventModal.scss';
import {API_URL} from "../../helper";

/*
* This is the register modal.
* It is responsible for rendering the register form.
* */

/**
 * Table USERS
 *  - UUID
 *  - Name
 *  - PW
 *  - Email
 **/
let schema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    passwordConfirm: yup.string().required()
});

class RegisterModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event: {
                name: '',
                email: '',
                password: '',
                passwordConfirm: ''
            },
            hasError: false,
            error: {},
            show: false
        }
        // No need for binding if you are using arrow functions
        // this.closeModal = this.closeModal.bind(this);
    }

    onChange = input => {
        const prevEvent = this.state.event;
        const {value, id} = input.target;
        prevEvent[id] = value;
        this.setState({
            error: {}
        })

    }

    handleRegister = (e) => {
        e.preventDefault();
        const {event} = this.state;

        if (event.password !== event.passwordConfirm) {
            this.setState({
                error: {
                    path: "passwordConfirm",
                    errors: ["비밀번호가 일치하지 않습니다."]
                }
            })
            return;
        }

        let jsondata = {
            "Name": event.name,
            "Email": event.email,
            "PW": event.password
        }

        schema
            .validate(event)
            .then(() => {
                fetch(`http://${API_URL}/register`, {
                    method: 'POST',
                    body: JSON.stringify(jsondata),
                    headers: {
                        'Content-Type': 'application/json',
                        "Allow-Control-Allow-Origin": "*"
                    }
                })
                    .then(res => res.json())
                    .then((res) => {
                        if (res.hasOwnProperty('detail')) {
                            alert(`회원가입 실패 ${res.detail}`)
                        } else {
                            this.closeModal();
                            alert('회원가입 성공')
                        }
                    })
                    .catch(err => {
                        alert("ERROR!!");
                        console.error(err);
                    })
            })
            .catch(err => {
                const error = {};
                err.inner.forEach(e => {
                    error[e.path] = e.message;
                });
                this.setState({hasError: true, error: err});
            });
    }

    closeModal = () => {
        //reset state before closing
        this.setState({
            event: {
                name: '',
                email: '',
                password: '',
                passwordConfirm: ''
            }
        });
        this.props.handleClose()
    }

    render() {
        const {name, email, password, passwordConfirm} = this.state.event;
        return (
            <div className="modal">
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered show={this.props.show} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>회원가입</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={e => this.handleRegister(e)}>
                            <Form.Group as={Row} className={"mb-3"} controlId="name">
                                <Form.Label column sm="3">
                                    이름
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control required type="text" placeholder="Name" value={name}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "name"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "name" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="email">
                                <Form.Label column sm="3">
                                    이메일
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control required type="email" placeholder="Email" value={email}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "email"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "email" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="password">
                                <Form.Label column sm="3">
                                    비밀번호
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control required type="password" placeholder="Password" value={password}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "password"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "password" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="passwordConfirm">
                                <Form.Label column sm="3">
                                    비밀번호 재입력
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control required type="password" placeholder="Confirm Password"
                                                  value={passwordConfirm}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "passwordConfirm"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "passwordConfirm" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Button variant="primary" type="submit" className={"float-end"}>
                                Register
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default RegisterModal;
