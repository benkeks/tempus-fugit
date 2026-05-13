export default [
	{
		"description":"Simple test",
		"formula":"a&b",
		"states":{
			"a":[1,0,1],
			"b":[1,0,1]
		},
		"evaluatedState":0,
		"expected":true
	},
	{
		"description":"Lightning Stand bug with full tables (see issue #43)",
		"formula":"#Ol&l&#F(s&n)",
		"states":{
			"l":[0,1,0,1,1,1],
			"s":[1,0,0,0,0,0],
			"n":[1,0,0,0,0,0]
		},
		"evaluatedState":5,
		"expected":true
	},
	{
		"description":"Lightning Stand bug with lazy tables (see issue #43)",
		"formula":"#Ol&l&#F(s&n)",
		"states":{
			"l":[0,1,0,1,1,1],
			"s":[1],
			"n":[1]
		},
		"evaluatedState":5,
		"expected":true
	},
]
