//Creates a basic Babylon.js scene.
//In case of more complexity I would have created a class to handle our scene.
function createScene() {
  let canvas = document.getElementById('renderCanvas')
  let engine = new BABYLON.Engine(canvas)
  let scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color3.Black()
  scene.uIds = []

  // camera setup
  var camera = new BABYLON.ArcRotateCamera(
    'Camera',
    0,
    0,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene
  )
  // Positions the camera overwriting alpha, beta, radius
  camera.setPosition(new BABYLON.Vector3(40, 40, 40))
  camera.attachControl(canvas, true)
  camera.panningSensibility = 0

  let light = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(0, 1, 0)
  )

  //start renderloop
  engine.runRenderLoop(function() {
    scene.render()
  })
  // Watch for browser/canvas resize events
  window.addEventListener('resize', function() {
    engine.resize()
  })

  //setup gizmo manager to handle pointer events
  var gizmoManager = new BABYLON.GizmoManager(scene)
  gizmoManager.positionGizmoEnabled = true
  gizmoManager.clearGizmoOnEmptyPointerEvent = true
  gizmoManager.usePointerToAttachGizmos = false

  //click events
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        console.log('POINTER DOWN')
        var pick = scene.pick(scene.pointerX, scene.pointerY)
        if (pick.hit) {
          gizmoManager.attachToMesh(pick.pickedMesh)
          scene.selectedMesh = pick.pickedMesh
        } else {
          gizmoManager.attachToMesh(null)
          scene.selectedMesh = null
        }
        break
    }
  })

  //add the database function as a callback to each gizmo's axis
  gizmoManager.gizmos.positionGizmo.xGizmo.snapDistance = 1
  gizmoManager.gizmos.positionGizmo.xGizmo.onSnapObservable.add(() => {
    moveObject(scene.selectedMesh)
  })
  gizmoManager.gizmos.positionGizmo.yGizmo.snapDistance = 1
  gizmoManager.gizmos.positionGizmo.yGizmo.onSnapObservable.add(() => {
    moveObject(scene.selectedMesh)
  })
  gizmoManager.gizmos.positionGizmo.yGizmo.snapDistance = 1
  gizmoManager.gizmos.positionGizmo.yGizmo.onSnapObservable.add(() => {
    moveObject(scene.selectedMesh)
  })

  //setup grid
  var grid = new BABYLON.GridMaterial('grid', scene)
  grid.gridRatio = 0.1

  var ground = BABYLON.Mesh.CreatePlane('box', 50, scene, false)
  ground.material = grid
  ground.rotation = new BABYLON.Vector3(1.5707963268, 0, 0)
  ground.isPickable = false

  //Add button to create meshes to scene
  let buttonCreate = document.createElement('button')
  buttonCreate.innerHTML = 'create mesh'
  buttonCreate.classList.add('btn')

  let container = document.getElementById('container')
  container.appendChild(buttonCreate)
  buttonCreate.onclick = () => {
    addBox(scene)
  }

  return scene
}

//random.range
function getRandom(min, max) {
  return Math.random() * (max - min) + min
}

//helper funtion for random vector3's
function getRandomVector3(x, y, z) {
  let rX = getRandom(x[0], x[1])
  let rY = getRandom(y[0], y[1])
  let rZ = getRandom(z[0], z[1])
  return new BABYLON.Vector3(rX, rY, rZ)
}

//create and store box object
function addBox(scene) {
  const box = BABYLON.MeshBuilder.CreateBox('box', {}, scene)
  let myMaterial = new BABYLON.StandardMaterial('standard', scene)

  myMaterial.emissiveColor = new BABYLON.Color3.Random()
  box.material = myMaterial
  box.position = getRandomVector3([-20, 20], [1, 20], [-20, 20])
  box.scaling = getRandomVector3([1, 3], [1, 3], [1, 3])
  scene.uIds.push(box.uniqueId)
  storeObject(box)
}
