const md5 = require("blueimp-md5");

const datas = {
	// 用户
	users: [
	{
		username:"user001",
		password:md5("123456"),
	},
	{
		username:"user002",
		password:md5("123456"),
	},
	{
		username:"user003",
		password:md5("123456"),
	},
	{
		username:"user004",
		password:md5("123456"),
	},
	],

	userdatas: [
	{
		userId:1,
		data:{},
	},
	],

	favorites:[],
	illegalUsers:[],
	userinfos:[],

	// 机构
	lessonOrganizations: [
	{
		name:"org1",
		state:0,
	},
	{
		name:"org2",
		state:0,
	},
	],

	// 机构班级
	lessonOrganizationClasses: [
	{
		organizationId: 1,
		name: "class1",
		begin: new Date(),
		end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
	},
	{
		organizationId: 1,
		name: "class2",
		begin: new Date(),
		end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
	},
	{
		organizationId: 2,
		name: "class3",
		begin: new Date(),
		end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
	},
	{
		organizationId: 1,
		name: "class4",
		begin: new Date("2019-01-01"),
		end: new Date("2019-04-01"),
	},
	],
	
	// 班级成员
	lessonOrganizationClassMembers: [
	{
		organizationId:1,
		classId: 0,
		roleId:64,
		memberId:1,
	},
	{
		organizationId:1,
		classId: 0,
		roleId:1,
		memberId:2,
	},
	{
		organizationId:1,
		classId: 0,
		roleId:2,
		memberId:3,
	},
	{
		organizationId:1,
		classId: 1,
		roleId:1,
		memberId:1,
	},
	{
		organizationId:1,
		classId: 1,
		roleId:2,
		memberId:2,
	},
	{
		organizationId:1,
		classId: 1,
		roleId:3,
		memberId:3,
	},
	{
		organizationId:1,
		classId: 4,
		roleId:3,
		memberId:2,
	},
	],

	// 机构课程包
	lessonOrganizationPackages: [
	{
		organizationId:1,
		classId: 0,
		packageId: 1,
		lessons: [{lessonId:1, lessonNo:1}, {lessonId:2, lessonNo:2}],
	},
	{
		organizationId:1,
		classId: 0,
		packageId: 2,
		lessons: [{lessonId:2, lessonNo:1}, {lessonId:3, lessonNo:2}],
	},
	],

	// 课程包数据
	packages: [
	{
		userId: 1,
		packageName:"pkg1",
		state:2,
	},
	{
		userId: 1,
		packageName:"pkg2",
		state:1,
	},
	{
		userId: 2,
		packageName:"pkg3",
		state:2,
	},
	],

	// 课程数据
	lessons: [
	{
		userId:1,
		lessonName:"lessonName1",
	},
	{
		userId:1,
		lessonName:"lessonName2",
	},
	{
		userId:1,
		lessonName:"lessonName3",
	},
	{
		userId:2,
		lessonName:"lessonName4",
	},
	{
		userId:2,
		lessonName:"lessonName5",
	},
	],

	// 课程包课程
	packageLessons: [
	{
		userId:1,
		packageId: 1,
		lessonId:1,
	},
	{
		userId:1,
		packageId: 1,
		lessonId:2,
	},
	{
		userId:1,
		packageId: 2,
		lessonId:2,
	},
	{
		userId:1,
		packageId: 2,
		lessonId:3,
	},
	{
		userId:2,
		packageId: 3,
		lessonId:3,
	},
	],

	// 课堂
	classrooms: [
	{
		userId:3,
		classId:1,
		packageId: 2,
		lessonId:2,
		key:"123456",
		state: 1,
	},
	],
}

module.exports = async (app) => {
	for (let key in datas) {
		if (app.model[key]){
			await app.model[key].sync({force:true});
			datas[key].length && await app.model[key].bulkCreate(datas[key]);
		} 
		if (app.lessonModel[key]){
			await app.lessonModel[key].sync({force:true});
			datas[key].length && await app.lessonModel[key].bulkCreate(datas[key]);
		} 
	}
}