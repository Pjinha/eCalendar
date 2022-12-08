import React, {Component} from 'react'
import {Modal, Button, Form, Row, Col, InputGroup} from 'react-bootstrap';
// there is a findDomNode warning that needs to be fixed
import * as moment from 'moment';
import * as yup from 'yup';
import './EventModal.scss';

let schema = yup.object().shape({
    ScheduleName: yup.string().trim('The title cannot include leading and trailing spaces').strict(true).required('Title is required'),
    CalendarDatabase: yup.string(),
    Starts: yup.date().required(),
    Ends: yup.date().min(yup.ref('start'), () => `End date can not be before start date!`).nullable().transform(v => (v instanceof Date && !isNaN(v) ? v : null)),
    StartsTime: yup.string(),
    EndsTime: yup.string(),
    // memo: yup.string()
});

class EventModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event: {
                ScheduleName: "",
                CalendarDatabase: "",
                Starts: '',
                Ends: '',
                StartsTime: '',
                EndsTime: '',
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
        const ScheduleName = e.target.ScheduleName.value;
        const CalendarDatabase = e.target.CalendarDatabase.value;
        let Starts = moment(e.target.Starts.value).format('YYYY-MM-DD');
        let Ends = moment(e.target.Ends.value).format('YYYY-MM-DD');
        const StartsTime = e.target.StartsTime.value;
        const EndsTime = e.target.EndsTime.value;
        // const memo = e.target.memo.value;
        if (StartsTime) {
            Starts += `T${StartsTime}`;
        }
        if (EndsTime) {
            Ends += `T${EndsTime}`;
        }
        const event = {
            ScheduleName,
            CalendarDatabase,
            Starts,
            Ends,
            allDay: false
        }
        if (StartsTime === "" || EndsTime === "") {
            event.allDay = true;
        }

        schema
            .validate(event)
            .then(() => {
                event.Ends = moment(event.Starts);
                if (!status) {
                    this.props.addEvent(event);
                } else {
                    this.props.updateEvent(event);
                }
                this.closeModal();
            })
            .catch(err => {
                this.setState({hasError: true, error: err});
                console.log(err)
            });
    }

    closeModal = () => {
        //reset state before closing
        this.setState({
            event: {
                ScheduleName: "",
                CalendarDatabase: "",
                Starts: '',
                Ends: '',
                StartsTime: '',
                EndsTime: '',
            }
        });
        this.props.handleClose()
    }

    render() {
        const {ScheduleName, CalendarDatabase, Starts, Ends, StartsTime, EndsTime} = this.state.event;
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
                            <Form.Group as={Row} className={"mb-3"} controlId="ScheduleName">
                                <Form.Label column sm="2">Title <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Control required type="text" placeholder="Event Title" value={ScheduleName}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "title"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "title" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"} controlId="CalendarDatabase">
                                <Form.Label column sm="2">Database <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Select aria-label="Default select example">
                                        {
                                            this.props.database.map((database, i) =>
                                                <option key={i} value={database.UUID}>{database.DatabaseName}</option>
                                            )
                                        }
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="Starts">
                                        <Form.Label column sm="4">Start Date <span
                                            className="required">*</span></Form.Label>
                                        <Col sm="8">
                                            <Form.Control required type="date" value={Starts} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>

                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="Ends">
                                        <Form.Label column sm="4">End Date</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="date" value={Ends} onChange={this.onChange}/>
                                        </Col>
                                        <Form.Control.Feedback className="error"
                                                               type="isInvalid">{this.state.error.errors && this.state.error.path === "end" && this.state.error.errors[0]}</Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Group>
                            </Form.Group>
                            <Form.Group as={Row} className={"mb-3"}>
                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="StartsTime">
                                        <Form.Label column sm="4">Begins</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" value={StartsTime} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Group as={Row} className={"mb-3"} controlId="EndsTime">
                                        <Form.Label column sm="4">Ends</Form.Label>
                                        <Col sm="8">
                                            <Form.Control type="time" value={EndsTime} onChange={this.onChange}/>
                                        </Col>
                                    </Form.Group>

                                </Form.Group>
                            </Form.Group>
                            {/*<Form.Group as={Row} className={"mb-3"} controlId="memo">*/}
                            {/*    <Form.Label column sm="2">*/}
                            {/*        Memo*/}
                            {/*    </Form.Label>*/}
                            {/*    <Col sm="10">*/}
                            {/*        <Form.Control as="textarea" value={memo} onChange={this.onChange}/>*/}
                            {/*    </Col>*/}
                            {/*</Form.Group>*/}
                            {/*<Form.Group as={Row} className={"mb-3"} controlId="todos">*/}
                            {/*    <Form.Label column sm="2">*/}
                            {/*        Todos*/}
                            {/*    </Form.Label>*/}
                            {/*    <Col sm="10">*/}
                            {/*        <InputGroup>*/}
                            {/*            <InputGroup.Checkbox aria-label="Checkbox for following text input"/>*/}
                            {/*            <Form.Control type="textbox" value={memo} onChange={this.onChange}/>*/}
                            {/*            <Button variant="outline-secondary" id="button-addon2">*/}
                            {/*                +*/}
                            {/*            </Button>*/}
                            {/*        </InputGroup>*/}
                            {/*    </Col>*/}
                            {/*</Form.Group>*/}
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
