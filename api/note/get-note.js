/**
 * Route: GET /notes/{note_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });

const _ = require('underscore');
const util = require('../util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async event => {
  try {
    let noteId = decodeURIComponent(event.pathParameters.note_id);

    let params = {
      TableName: tableName,
      KeyConditionExpression: 'id = :note_id and relationship_id = :version',
      ExpressionAttributeValues: {
        ':note_id': noteId,
        ':version': util.getCurrentNoteVersionPrefix()
      },
      Limit: 1
    };

    let data = await dynamodb.query(params).promise();
    if (!_.isEmpty(data.Items)) {
      return {
        statusCode: 200,
        headers: util.getResponseHeaders(),
        body: JSON.stringify(data.Items[0])
      }
    } else {
      return {
        statusCode: 404,
        headers: util.getResponseHeaders()
      }
    }

  } catch (err) {
    console.log('Error', err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
}
