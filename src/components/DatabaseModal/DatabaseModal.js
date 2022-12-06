import React, {Component} from 'react'
import {Modal, Button, Form, Row, Col} from 'react-bootstrap';
// there is a findDomNode warning that needs to be fixed
import * as yup from 'yup';

let schema = yup.object().shape({
    title: yup.string().trim('The title cannot include leading and trailing spaces').strict(true).required('Title is required')
});

class DatabaseModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            database: {
                title: "",
            },
            hasError: false,
            error: {}
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (Object.keys(props.database).length !== 0) {
            return {database: props.database};
        }
        return state;
    }

    onChange = input => {
        const prevDatabase = this.state.database;
        const {value, id} = input.target;
        prevDatabase[id] = value;
        this.setState({
            database: prevDatabase,
            error: {}
        })
    }

    handleAddUpdateDatabase = (e, status) => {
        e.preventDefault();
        const title = e.target.title.value;
        const database = {
            title
        }
        schema
            .validate(database)
            .then(() => {
                if (!status) {
                    this.props.addDatabase(database);
                } else {
                    this.props.updateDatabase(database);
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
            database: {
                title: ""
            }
        });
        this.props.handleClose()
    }

    render() {
        const {title} = this.state.database;
        return (
            <div className="modal">
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered show={this.props.show} onHide={this.closeModal} backdrop={"static"}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add a {this.props.noDatabase ? "first" : "new" } database</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={e => this.handleAddUpdateDatabase(e, Object.keys(this.props.database).length !== 0)}>
                            <Form.Group as={Row} className={"mb-3"} controlId="title">
                                <Form.Label column sm="2">Title <span className="required">*</span></Form.Label>
                                <Col sm="10">
                                    <Form.Control required type="text" placeholder="Database Title" value={title}
                                                  onChange={this.onChange}
                                                  isInvalid={this.state.error.path === "title"}/>
                                    <Form.Control.Feedback className="error"
                                                           type="isInvalid">{this.state.error.errors && this.state.error.path === "title" && this.state.error.errors[0]}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Row>
                                <Col align="center">
                                    <Button variant="primary" type="submit">
                                        {Object.keys(this.props.database).length === 0 ? "Add" : "Update"} Database
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    {   !this.props.noDatabase &&
                        <Modal.Footer>
                            {Object.keys(this.props.database).length !== 0 ? <Button variant="danger" onClick={() => {
                                this.props.deleteDatabase(this.props.database);
                                this.closeModal()
                            }}>
                                Delete
                            </Button> : ""
                            }
                            <Button variant="secondary" onClick={this.closeModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    }
                </Modal>
            </div>
        );
    }

}

export default DatabaseModal;
