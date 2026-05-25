namespace BookingInfor.DB;

public static class AppPrivilege
{
	public enum statusActive
	{
		All,
		Complete,
		Incomplete
	}

	public enum statusMove
	{
		MoveFirst,
		MovePrevious,
		MoveNext,
		MoveLast
	}

	public enum filterDate
	{
		All,
		ThreeMonth,
		SixMonth,
		OneYear
	}

	public enum PrivilageLevel
	{
		Admin,
		User
	}

	public static PrivilageLevel Level = PrivilageLevel.User;
}
