import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

	{

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'resources/images/checker.png' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

	{

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 3;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

    const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const cubeGeo = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );


	const radius = 1; // 
	const widthSegments = 32; // 
	const heightSegments = 16; // 
	const sphereGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);


	const capsuleRadius = 1; // 胶囊体的半径
	const capsuleHeight = 2; // 胶囊体中间圆柱体的高度
	const sphereDetail = 32; // 球体细节，越高球体越平滑
	const cylinderDetail = 32; // 圆柱体细节

	// 创建胶囊体的上半球
	const topSphereGeo = new THREE.SphereGeometry(capsuleRadius, sphereDetail, sphereDetail, 0, Math.PI * 2, 0, Math.PI / 2);
	// 创建胶囊体的下半球
	const bottomSphereGeo = new THREE.SphereGeometry(capsuleRadius, sphereDetail, sphereDetail, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
	// 创建胶囊体的中间圆柱部分
	const cylinderGeo = new THREE.CylinderGeometry(capsuleRadius, capsuleRadius, capsuleHeight, cylinderDetail);


	const loader = new THREE.TextureLoader();



	function makeInstance( geometry, color, x, y) {

		const material = new THREE.MeshPhongMaterial( { color } );

		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		cube.position.x = x;

		cube.position.y = y;

		return cube;

	}

	
	function loadColorTexture( path ) {

		const texture = loader.load( path );
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;

	}



	function makeMaterialInstance(geometry,  x, y) {
		const materials = [
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-1.jpg' ) } ),
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-2.jpg' ) } ),
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-3.jpg' ) } ),
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-4.jpg' ) } ),
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-5.jpg' ) } ),
			new THREE.MeshBasicMaterial( { map: loadColorTexture( 'resources/images/flower-6.jpg' ) } ),
		];
		const cube = new THREE.Mesh( geometry, materials );
		scene.add( cube );
		

		cube.position.x = x;

		cube.position.y = y;

		return cube;	
	}

	const geometries = [
		makeInstance( sphereGeo, 0x44aa88, 9, 5),
		makeInstance( sphereGeo, 0x8844aa, 5, 5),
		makeInstance( sphereGeo, 0xaa8844, 7, 5),

		makeMaterialInstance( cubeGeo,  -9, 7),
		makeMaterialInstance( cubeGeo,  -5, 7),
		makeMaterialInstance( cubeGeo,  -7, 7),

		makeInstance( cubeGeo, 0x44aa88, 9, 2),
		makeInstance( cubeGeo, 0x8844aa, 5, 2),
		makeInstance( cubeGeo, 0xaa8844, 7, 2),

		makeInstance( cylinderGeo, 0x44aa88, 9, 9),
		makeInstance( cylinderGeo, 0x8844aa, 5, 9),
		makeInstance( cylinderGeo, 0xaa8844, 7, 9),
	];





	{

		const mtlLoader = new MTLLoader();
		mtlLoader.load( 'resources/models/windmill.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			mtl.materials.Material.side = THREE.DoubleSide;
			objLoader.setMaterials( mtl );
			objLoader.load( 'resources/models/windmill.obj', ( root ) => {

				scene.add( root );

			} );

		} );

	}

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render(time) {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

        time *= 0.001; // convert time to seconds

		geometries.forEach( ( cube, ndx ) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );


		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();