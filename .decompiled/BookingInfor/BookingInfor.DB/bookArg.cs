using System;

namespace BookingInfor.DB;

public class bookArg
{
	public DateTime docDate { get; set; }

	public string docTime { get; set; }

	public string docNo { get; set; }

	public string agentCode { get; set; }

	public string agentName { get; set; }

	public string guideCode { get; set; }

	public string guideName { get; set; }

	public string partyCode { get; set; }

	public string telGuide { get; set; }

	public string telDriver { get; set; }

	public string carCode { get; set; }

	public short pax { get; set; }

	public string remark { get; set; }

	public DateTime? dateBookJW { get; set; }

	public string timeBookJW { get; set; }

	public DateTime? dateBookBKF { get; set; }

	public string timeBookBKF { get; set; }

	public DateTime? dateBookRTH { get; set; }

	public string timeBookRTH { get; set; }

	public DateTime? dateBookTRP { get; set; }

	public string timeBookTRP { get; set; }

	public DateTime? arriveDate { get; set; }

	public DateTime? departureDate { get; set; }

	public string nationCode { get; set; }

	public string firstShop { get; set; }

	public DateTime? ptyDateStart { get; set; }

	public DateTime? ptyDateEnd { get; set; }

	public string importType { get; set; }

	public string complete { get; set; }

	public DateTime? orderDate { get; set; }

	public int faxNo { get; set; }

	public string agentCodeRef { get; set; }

	public string partyCodeRef { get; set; }

	public string remarkBook { get; set; }

	public int seriesNo { get; set; }
}
