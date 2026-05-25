using System;

namespace BookingInfor.DB;

internal class ParaClass
{
	private static DateTime _GetDate = DateTime.Now;

	private static DateTime _ServerDate;

	private static string _UserLogin = "";

	private static string _UserLoginName = "";

	private static string _UserLevel = "";

	private static string _rRef = "";

	private static string _rRefFields = "";

	private static string _rRef2 = "";

	private static bool _isTestProg = false;

	public static DateTime GetDate
	{
		get
		{
			return _GetDate;
		}
		set
		{
			_GetDate = value;
		}
	}

	public static DateTime ServerDate
	{
		get
		{
			return _ServerDate;
		}
		set
		{
			_ServerDate = value;
		}
	}

	public static string UserLogin
	{
		get
		{
			return _UserLogin;
		}
		set
		{
			_UserLogin = value;
		}
	}

	public static string UserLoginName
	{
		get
		{
			return _UserLoginName;
		}
		set
		{
			_UserLoginName = value;
		}
	}

	public static string UserLevel
	{
		get
		{
			return _UserLevel;
		}
		set
		{
			_UserLevel = value;
		}
	}

	public static string rRef
	{
		get
		{
			return _rRef;
		}
		set
		{
			_rRef = value;
		}
	}

	public static string rRefFields
	{
		get
		{
			return _rRefFields;
		}
		set
		{
			_rRefFields = value;
		}
	}

	public static string rRef2
	{
		get
		{
			return _rRef2;
		}
		set
		{
			_rRef2 = value;
		}
	}

	public static bool isTestProg
	{
		get
		{
			return _isTestProg;
		}
		set
		{
			_isTestProg = value;
		}
	}
}
