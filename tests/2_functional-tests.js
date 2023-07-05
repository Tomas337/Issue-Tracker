const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .set("content-type", "application/json")
      .send({
        issue_title: "test title",
        issue_text: "Lorem ipsum...",
        created_by: "Tom",
        assigned_to: "Josef",
        status_text: "stuff"
      })
      .end(function (err, res) {
        deleteId = res.body._id;
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "test title");
        assert.equal(res.body.issue_text, "Lorem ipsum...")
        assert.equal(res.body.created_by,  "Tom");
        assert.equal(res.body.assigned_to, 'Josef');
        assert.equal(res.body.status_text, 'stuff');
        done();
      });
  });
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .set("content-type", "application/json")
      .send({
        issue_title: "test title",
        issue_text: "Lorem ipsum...",
        created_by: "Tom",
        assigned_to: "",
        status_text: ""
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "test title");
        assert.equal(res.body.issue_text, "Lorem ipsum...")
        assert.equal(res.body.created_by,  "Tom");
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .set("content-type", "application/json")
      .send({
        issue_title: "",
        issue_text: "",
        created_by: "",
        assigned_to: "",
        status_text: ""
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/abc')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest')
      .query({ _id: "64a57e7eac7b7230ba3c74b1" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {"issue_title":"Pepa","issue_text":"Lorem ipsum...","created_on":"2023-07-05T14:30:22.359Z","updated_on":"2023-07-05T15:10:06.749Z","created_by":"Tom","assigned_to":"Josef","open":true,"status_text":"","_id":"64a57e7eac7b7230ba3c74b1"});
        done();
      });
  });
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest')
      .query({ "open":true,"created_on":"2023-07-05T14:30:22.359Z","updated_on":"2023-07-05T15:10:06.749Z","created_by":"Tom","assigned_to":"Josef","status_text":"","_id":"64a57e7eac7b7230ba3c74b1" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {"issue_title":"Pepa","issue_text":"Lorem ipsum...","created_on":"2023-07-05T14:30:22.359Z","updated_on":"2023-07-05T15:10:06.749Z","created_by":"Tom","assigned_to":"Josef","open":true,"status_text":"","_id":"64a57e7eac7b7230ba3c74b1"});
        done();
      });
  });
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: "64a57fde127b30db4fbb4ae9", issue_title:"Pepa" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, "64a57fde127b30db4fbb4ae9");
        done();
      });
  });
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: "64a586ad0d39252a60f0d900", issue_title: "Pepa", created_by: "Pepa" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, "64a586ad0d39252a60f0d900");
        done();
      });
  });
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: "", issue_title: "Pepa", created_by: "Pepa" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: "64a584f57dc82482bf9a737b"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: "abcsadf", issue_title: "Pepa", created_by: "Pepa" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        done();
      });
  });
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({ _id: deleteId})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({ _id: "abc"})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({ })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
