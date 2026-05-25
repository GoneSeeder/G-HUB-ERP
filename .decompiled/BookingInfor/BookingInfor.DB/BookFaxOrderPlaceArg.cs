using System;

namespace BookingInfor.DB;

public class BookFaxOrderPlaceArg
{
	public DateTime? orderDate { get; set; }

	public int faxNo { get; set; }

	public string agentCode { get; set; }

	public string partyCode { get; set; }

	public string placeCode { get; set; }

	public DateTime? startDate { get; set; }

	public DateTime? endDate { get; set; }

	public int seriesNo { get; set; }
}
