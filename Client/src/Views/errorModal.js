import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const ErrorModal = (props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() =>{
    setShow(props.show)
  }, [props.show])

  return (
    <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>
            Chiudi
          </Button>
          <Button onClick={handleClose} variant="danger">Ho capito</Button>
        </Modal.Footer>
      </Modal>
  )
}

export default ErrorModal