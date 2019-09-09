
// import * as firebase from 'firebase';
import * as firebase from 'firebase';

declare module 'firebase' {
    namespace firestore {
        interface DocumentReference {
            patch(patchData: any): Promise<void>
        }
    }
}

/**
 * Updates the top level properties with the provided data. Note that the values provided in patchData
 * will replace the value stored in the database completely.
 */
firebase.firestore.DocumentReference.prototype.patch = async function (patchData: any) {
  console.log('firebase.firestore.DocumentReference.prototype.patch()', patchData);

  const document = (this as firebase.firestore.DocumentReference);

  const newData = Object.assign({},
    await document.get(),
    patchData);

  console.log(`Updating document ${document.path}`, newData);
  return document.update(newData);
};
