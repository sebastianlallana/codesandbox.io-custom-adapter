const _ = require('lodash');
const express = require('express');

const router = express.Router();
const { isTokenValid } = require('./helpers/TestOAuthServer');
const authSettings = require('../auth-settings');

router.post('/me/messages', async(req, res) => {
  console.log(`/me/messages called with: ${JSON.stringify({
    body: req.body,
    access_token: req.query.access_token,
    req_query: req.query,
  })}`);

  const authz = req.get('Authorization');
  console.log('Authorization header value = ', authz);
  let valid = false;
  if (authz && authz.startsWith('Bearer')) {
    const token = authz.split(' ')[1];
    if(authSettings.authTypeOutbound === 'Oauth2'){
      valid = isTokenValid(token);
    }else if(authSettings.authTypeOutbound === 'API-Token'){
      valid = _.isEqual(token, authSettings.accessToken);
    }
    console.log('Successfully verified Bearer access token');
  } else if (authSettings.authTypeOutbound === 'API-Token' && _.isEqual(req.query.access_token, authSettings.accessToken)) {
    valid = true;
    console.log('Successfully verified API Token');
  }

  /*await new Promise(resolve => {
    console.log("waiting 15s")
    setTimeout(() => {
      console.log("finish")
    resolve()
    }, 15000);
  })*/
  /*
  return  res.status(400).json({
      message: 'Bad Request'
  });
  */
  
  if (valid) {
    const response = {
      recipient_id: req.body.recipient.id, // Messaging service consumer id
      message_id: `${req.body.recipient.id}.${new Date().getTime()}` // Messaging service individual message id
    };
    console.log(`Returning response for /me/messages call: ${JSON.stringify(response)}`);
    res.json(response);
  } else {
    console.warn('Invalid token in request to /me/messages');
    res.status(401).json({
      status: 'Invalid token'
    });
  }
});

module.exports = router;
