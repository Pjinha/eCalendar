import React, {Component} from 'react'
import {Modal, Button, Form, Row, Col, InputGroup} from 'react-bootstrap';
// there is a findDomNode warning that needs to be fixed
import * as moment from 'moment';
import * as yup from 'yup';
import './EventModal.scss';

let schema = yup.object().shape({
    title: yup.string().trim('The title cannot include leading and trailing spaces').strict(true).required('Title is required'),
    category: yup.string().required('Category is required'),
    start: yup.date().required(),
    end: yup.date().min(yup.ref('start'), () => `End date can not be before start date!`),
    startTime: yup.string(),
    endTime: yup.string(),
    memo: yup.string()
});

class EventModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event: {
                title: "",
                category: "",
                start: '',
                end: '',
                startTime: '',
                endTime: '',
                memo: ''
            },
            hasError: false,
            error: {}
        }
        // No need for binding if you are using arrow functions
        // this.closeModal = this.closeModal.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (Object.keys(props.event).length !== 0) {
            return {event: props.event};
        }
        return state;
    }

    onChange = input => {
        const prevEvent = this.state.event;
        const {value, id} = input.target;
        prevEvent[id] = value;
        this.setState({
            event: prevEvent,
            error: {}
        })
    }

    handleAddUpdateEvent = (e, status) => {
        e.preventDefault();
        const title = e.target.title.value;
        const category = e.target.category.value;
        let start = moment(e.target.start.value).format('YYYY-MM-DD');
        let end = moment(e.target.end.value).format('YYYY-MM-DD');
        const startTime = e.target.startTime.value;
        const endTime = e.target.endTime.value;
        const memo = e.target.memo.value;
        if (!end) {
            end = start;
        }
        if (startTime) {
            start += `T${startTime}`;
        }
        if (endTime) {
            end += `T${endTime}`;
        }
        const event = {
            title,
            category,
            start,
            end,
            allDay: false
        }
        if (startTime === "" || endTime === "") {
            event.allDay = true;
        }

        schema
            .validate(event)
            .then(() => {
                //if status===false add new event otherwise update
                // TODO: add a new event with fetch request
                if (!status) {
                    this.props.addEvent(event);
                } else {
                    this.props.updateEvent(event);
                }
                this.closeModal();
            })
            .catch(err => {
                this.setState({hasError: true, error: err});
            });
    }

    closeModal = () => {
        //reset state before closing
        this.setState({
            event: {
                title: "",
                category: "",
                start: '',
                end: '',
                startTime: '',
                endTime: '',
                memo: ''
            }
        });
        this.props.handleClose()
    }

    render() {
        const {title, category, start, end, startTime, endTime, memo} = this.state.event;
        return (
            <div className="modal">
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered show={this.props.show} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add a new event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={e => this.handleAddUpdateEvent(e, Object.keys(this.props.event).length !== 0)}>
                            <Form.Group as={Row} className={"mb-3"} controlId="title">
                                <Form.Label column sm="2">Title <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Control required type="text" placeholder="Event Title" value={title}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "title"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "title" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="category">
                                <Form.Label column sm="2">Category <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Control required type="text" placeholder="Category" value={category}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "category"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "category" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="start">
                                        <Form.Label column sm="4">Start Date <span
                                            className="required">*</span></Form.Label>
                                        <Col sm="8">
                                            <Form.Control required type="date" value={start} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>

                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="end">
                                        <Form.Label column sm="4">End Date</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="date" value={end} onChange={this.onChange}/>
                                        </Col>
                                        <Form.Control.Feedback className="error"
                                                               type="isInvalid">{this.state.error.errors && this.state.error.path === "end" && this.state.error.errors[0]}</Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Group>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="startTime">
                                        <Form.Label column sm="4">Begins</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" value={startTime} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="endTime">
                                        <Form.Label column sm="4">Ends</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" value={endTime} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>

                                </Form.Group>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="memo">
                                <Form.Label column sm="2">
                                    Memo
                                </Form.Label>
                                <Col sm="10">
                                    <Form.Control as="textarea" value={memo} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="todos">
                                <Form.Label column sm="2">
                                    Todos
                                </Form.Label>
                                <Col sm="10">
                                    <InputGroup>
                                        <InputGroup.Checkbox aria-label="Checkbox for following text input"/>
                                        <Form.Control type="textbox" value={memo} onChange={this.onChange}/>
                                        <Button variant="outline-secondary" id="button-addon2">
                                            +
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                            <Row>
                                <Col align="center">
                                    <Button variant="primary" type="submit">
                                        {Object.keys(this.props.event).length === 0 ? "Add" : "Update"} Event
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        {Object.keys(this.props.event).length !== 0 ? <Button variant="danger" onClick={() => {
                            this.props.deleteEvent(this.props.event);
                            this.closeModal()
                        }}>
                            Delete
                        </Button> : ""
                        }
                        <Button variant="secondary" onClick={this.closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

}

export default EventModal;
