export interface Project {
    preview: string
    title: string
    assets: {
        type: 'image' | 'video' | '3d'
        url: string
        alt?: string,
        priority?: number
    }[]
}

const projects: Project[] = [
    {
        preview: 'Work/Bee Drone 1.png',
        title: 'Bee Drone',
        assets: [
            {type: 'image', url: 'Work/Bee Drone 1.png', priority: 0},
            {type: '3d', url: 'Work/Bee.glb', priority: 1}
        ]
    },
    {
        preview: 'Work/Turret 1.png',
        title: 'Turret',
        assets: [
            {type: 'image', url: 'Work/Turret 1.png', priority: 0},
            {type: '3d', url: 'Work/Turret.glb', priority: 1}
        ]
    },
    {
        preview: 'Work/Stylized 3D Airplane Prop 2.png',
        title: 'Airplane Prop',
        assets: [
            {type: 'image', url: 'Work/Stylized 3D Airplane Prop 2.png'},
        ]
    },
    {
        preview: 'Work/Stylized 3D Fox Character.png',
        title: 'Fox Character',
        assets: [
            {type: 'image', url: 'Work/Stylized 3D Fox Character.png', priority: 0},
            {type: '3d', url: 'Work/3d fox.glb', priority: 1}
        ]
    },
    {
        preview: 'Work/3D Interior Storytelling Scene 1.png',
        title: 'Interior Storytelling Scene',
        assets: [
            {type: 'image', url: 'Work/3D Interior Storytelling Scene 1.png', priority: 0},
        ]
    },
    {
        preview: 'Work/Sci-Fi Vehicle 1.png',
        title: 'Sci-Fi Vehicle',
        assets: [
            {type: 'image', url: 'Work/Sci-Fi Vehicle 1.png', priority: 0},
            {type: '3d', url: 'Work/laser car.glb', priority: 1},
        ]
    },
    {
        preview: 'Work/Stylized 3D Bull Character.png',
        title: 'Bull Character',
        assets: [
            {type: 'image', url: 'Work/Stylized 3D Bull Character.png'},
        ]
    },
    {
        preview: 'Work/Robot_1.png',
        title: 'ITI Robot',
        assets: [
            {type: 'image', url: 'Work/Robot_1.png'},
            {type: 'image', url: 'Work/Robot_2.png'},
            {type: '3d', url: 'Work/robot ITI Remake.glb', priority: 1}
        ],
    },
    {
        preview: 'Work/Spring 1.png',
        title: 'Seasons',
        assets: [
            {type: 'image', url: 'Work/Spring 1.png', priority: 0},
            {type: 'image', url: 'Work/Spring 2.png', priority: 0},
            {type: 'image', url: 'Work/Spring 3.png', priority: 0},
            {type: 'image', url: 'Work/Summer 1.png', priority: 0},
            {type: 'image', url: 'Work/Summer 2.png', priority: 0},
            {type: 'image', url: 'Work/Summer 3.png', priority: 0},
            {type: 'image', url: 'Work/Winter 1.png', priority: 0},
            {type: 'image', url: 'Work/Winter 2.png', priority: 0},
            {type: 'image', url: 'Work/Winter 3.png', priority: 0},
            {type: '3d', url: 'Work/winter scene.glb', priority: 1}
        ]
    }
]

export default projects