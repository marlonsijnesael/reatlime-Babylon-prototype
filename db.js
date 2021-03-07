const clientId = String((Math.random() * 10000000).toFixed(0))

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
db.settings({ timestampsInSnapshots: true })

//add object to db as document
function storeObject(mesh) {
  let serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh)

  let strMesh = JSON.stringify(serializedMesh)
  db.collection('scene')
    .doc(String(mesh.uniqueId))
    .set({
      object: strMesh,
      clientId: clientId,
      date: Date.now()
    })
}

//update object after move
function moveObject(mesh) {
  let serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh)
  let strMesh = JSON.stringify(serializedMesh)
  db.collection('scene')
    .doc(String(mesh.uniqueId))
    .update({
      object: strMesh,
      date: Date.now()
    })
}

// real-time listener
db.collection('scene').onSnapshot((snapshot) => {
  let changes = snapshot.docChanges()

  //loop through all changes
  changes.forEach((change) => {
    console.log('NEW CHANGE!', change.type)
    if (change.type == 'added') {
      //get our mesh data as string
      let strData = change.doc.data().object

      if (change.doc.data().clientId !== clientId) {
        //Use babylon mesh loader to import data into scene
        BABYLON.SceneLoader.ImportMesh(
          '',
          '',
          'data:' + strData,
          scene,
          function(newMesh) {
            scene.executeWhenReady(() => {
              scene.meshes.push(newMesh[0])
              let canvas = document.getElementById('renderCanvas')
              scene.activeCamera.attachControl(canvas, false)
              newMesh[0].uniqueId = change.doc.id
              newMesh[0].name += newMesh.uniqueId
            })
          }
        )
      } else {
        console.log('created on this client')
      }
    }
    //update case
    else if (change.type == 'modified') {
      let newData = JSON.parse(change.doc.data().object)
      let uID = change.doc.id
      let pos = new BABYLON.Vector3()
      for (key in newData) {
        console.log(key)
        if (key === 'meshes') {
          console.log('MESHES', newData[key][0].position)
          pos = BABYLON.Vector3.FromArray(newData[key][0].position)
          console.log('pos', pos)
        }
      }
      scene.getMeshByUniqueID(uID).position = pos
    }
  })
})
