import { takeLatest, call } from 'redux-saga/effects';
import { initialize } from './client'
import { streamingClient } from '../../utils/webrtc/client'

function* connect () {
  // yield call(streamingClient.connect);
}

export default function* streamingSaga() {
  // yield takeLatest(initialize, connect);
}
