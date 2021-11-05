import { all } from 'redux-saga/effects';
import streaming from '../features/streaming/sagas';

function* rootSaga() {
  try {
    yield all([
      streaming()
    ]);
  } catch (error) {
    console.error(error);
  }
}

export default rootSaga;
