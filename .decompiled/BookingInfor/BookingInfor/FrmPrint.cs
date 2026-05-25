using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using BookingInfor.DB;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Windows.Forms;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraTab;

namespace BookingInfor;

public class FrmPrint : XtraForm
{
	private class iReport
	{
		public ReportDocument Report;

		public int PrintCopy;
	}

	public bool IsUserPrinted = false;

	private Dictionary<string, iReport> iReports = new Dictionary<string, iReport>();

	private PanelControl pnlBody;

	private XtraTabControl tabControl1;

	private Control pageView;

	private PrintDialog dialog1 = new PrintDialog();

	public bool printAll = false;

	public bool printImmediately = false;

	private IContainer components = null;

	private CrystalReportViewer crystalReportViewer1;

	private ImageList imageList1;

	public string ReportName { get; set; }

	public string SelectionFormula { get; set; }

	public FrmPrint()
	{
		InitializeComponent();
		InitPage();
	}

	private void InitPage()
	{
		base.KeyPreview = true;
		dialog1.AllowSomePages = false;
		dialog1.AllowPrintToFile = false;
		dialog1.AllowSelection = false;
		if (printAll)
		{
			dialog1.AllowCurrentPage = false;
		}
		tabControl1 = new XtraTabControl();
		tabControl1.Dock = DockStyle.Fill;
		tabControl1.SelectedPageChanged += tabControl_SelectedPageChanged;
		pnlBody = new PanelControl();
		pnlBody.Dock = DockStyle.Fill;
		pnlBody.Controls.Add(tabControl1);
		pnlBody.BorderStyle = BorderStyles.NoBorder;
		pnlBody.Padding = new Padding(0, 10, 0, 10);
		pageView = crystalReportViewer1.Controls[0];
		crystalReportViewer1.Controls.Add(pnlBody);
		crystalReportViewer1.Controls[0].SendToBack();
		crystalReportViewer1.Controls[1].SendToBack();
		crystalReportViewer1.Controls[2].SendToBack();
		crystalReportViewer1.Controls[3].SendToBack();
		crystalReportViewer1.Controls[5].BringToFront();
		ToolStripButton toolStripButton = new ToolStripButton();
		int num = 0;
		foreach (ToolStrip item in crystalReportViewer1.Controls.OfType<ToolStrip>())
		{
			item.Padding = new Padding(5);
			item.ImageList = imageList1;
			item.ImageScalingSize = new Size(32, 32);
			int num2 = 0;
			foreach (ToolStripButton item2 in item.Items.OfType<ToolStripButton>())
			{
				if (item2.ToolTipText.ToLower().Contains("พ\u0e34มพ\u0e4cรายงาน"))
				{
					num = num2;
					item2.Visible = false;
				}
				switch (item2.ToolTipText.ToLower())
				{
				case "เอ\u0e4aกซ\u0e4cปอร\u0e4cตรายงาน":
					item2.ImageIndex = 0;
					break;
				case "ร\u0e35เฟรช":
					item2.ImageIndex = 2;
					break;
				case "ไปท\u0e35\u0e48หน\u0e49าแรก":
					item2.ImageIndex = 5;
					break;
				case "ไปท\u0e35\u0e48หน\u0e49าก\u0e48อน":
					item2.ImageIndex = 6;
					break;
				case "ไปท\u0e35\u0e48หน\u0e49าถ\u0e31ดไป":
					item2.ImageIndex = 7;
					break;
				case "ไปท\u0e35\u0e48หน\u0e49าส\u0e38ดท\u0e49าย":
					item2.ImageIndex = 8;
					break;
				case "ค\u0e49นหาข\u0e49อความ":
					item2.ImageIndex = 9;
					break;
				}
				item2.AutoSize = false;
				item2.Width = 40;
				item2.Height = 40;
				item2.ImageIndex = num2;
				num2++;
			}
			foreach (ToolStripDropDownButton item3 in item.Items.OfType<ToolStripDropDownButton>())
			{
				if (item3.ToolTipText == "ซ\u0e39ม")
				{
					item3.AutoSize = false;
					item3.Width = 50;
					item3.Height = 40;
					item3.ImageIndex = 12;
				}
			}
			toolStripButton.ToolTipText = "พ\u0e34มพ\u0e4cรายงานของฉ\u0e31น";
			toolStripButton.AutoSize = false;
			toolStripButton.Width = 40;
			toolStripButton.Height = 40;
			toolStripButton.ImageIndex = num;
			toolStripButton.DisplayStyle = ToolStripItemDisplayStyle.Image;
			toolStripButton.Click += printButton_Click;
			item.Items.Insert(num, toolStripButton);
		}
		crystalReportViewer1.Zoom(100);
		crystalReportViewer1.ToolPanelView = ToolPanelViewType.None;
		crystalReportViewer1.ShowGroupTreeButton = false;
		crystalReportViewer1.ShowParameterPanelButton = false;
		crystalReportViewer1.EnableDrillDown = false;
	}

	private void tabControl_SelectedPageChanged(object sender, EventArgs e)
	{
		SelectReport(tabControl1.SelectedTabPage.Text);
	}

	public void SelectReport(string reportName)
	{
		for (int i = 0; i < tabControl1.TabPages.Count; i++)
		{
			if (tabControl1.TabPages[i].Text == reportName)
			{
				tabControl1.TabPages[i].Controls.Add(pageView);
				crystalReportViewer1.ReportSource = iReports[reportName].Report;
			}
			else
			{
				tabControl1.TabPages[i].Controls.Clear();
			}
		}
	}

	private void printButton_Click(object sender, EventArgs e)
	{
		int copies = dialog1.PrinterSettings.Copies;
		int fromPage = dialog1.PrinterSettings.FromPage;
		int toPage = dialog1.PrinterSettings.ToPage;
		bool collate = dialog1.PrinterSettings.Collate;
		if (printAll)
		{
			foreach (string key in iReports.Keys)
			{
				PrintReport(key);
			}
		}
		else
		{
			PrintReport(tabControl1.SelectedTabPage.Text);
		}
		base.DialogResult = DialogResult.OK;
	}

	private void PrintReport(string reportName)
	{
		dialog1.PrinterSettings.Copies = (short)iReports[reportName].PrintCopy;
		if (printImmediately || dialog1.ShowDialog() == DialogResult.OK)
		{
			iReports[reportName].Report.PrintToPrinter(dialog1.PrinterSettings, dialog1.PrinterSettings.DefaultPageSettings, reformatReportPageSettings: false);
		}
	}

	private void FrmPrint_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.Modifiers == Keys.Control)
		{
			Keys keyCode = e.KeyCode;
			if (keyCode == Keys.P)
			{
				printButton_Click(null, null);
			}
		}
		else
		{
			Keys keyCode2 = e.KeyCode;
			if (keyCode2 == Keys.Escape)
			{
				Close();
			}
		}
	}

	public void AddFormulaFieldParameter(string reportName, string formulaFieldName, string value)
	{
		iReports[reportName].Report.DataDefinition.FormulaFields[formulaFieldName].Text = "'" + value + "'";
	}

	public void AddReport(string reportName, string recordSelectionFormula, int printCopy)
	{
		string stringConnection = DAL.StringConnection;
		string text = DAL.StringConnection.Split('=')[1];
		text = text.Split(';')[0];
		string text2 = DAL.StringConnection.Split('=')[2];
		text2 = text2.Split(';')[0];
		string text3 = DAL.StringConnection.Split('=')[3];
		text3 = text3.Split(';')[0];
		string text4 = DAL.StringConnection.Split('=')[4];
		text4 = text4.Split(';')[0];
		ReportDocument reportDocument = new ReportDocument();
		try
		{
			string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
			reportDocument.Load(baseDirectory + "RPT\\" + reportName);
		}
		catch (Exception ex)
		{
			MessageBox.Show("Error " + reportName + " : " + ex.Message, "ผ\u0e34ดพลาด", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return;
		}
		reportDocument.RecordSelectionFormula = recordSelectionFormula;
		string strCompanyCode = StCl.MT.StrCompanyCode;
		reportDocument.DataDefinition.FormulaFields["Company1"].Text = "'" + strCompanyCode + "'";
		reportDocument.DataDefinition.FormulaFields["Head1"].Text = "''";
		reportDocument.SetDatabaseLogon(text3, text4);
		reportDocument.DataSourceConnections[0].SetConnection("Driver={SQL Server};Server=" + text + ";Port=1433;", text2, text3, text4);
		iReport iReport = new iReport();
		iReport.Report = reportDocument;
		iReport.PrintCopy = printCopy;
		iReports.Add(reportName, iReport);
		XtraTabPage xtraTabPage = new XtraTabPage();
		xtraTabPage.Text = reportName;
		tabControl1.TabPages.Add(xtraTabPage);
		int zoomLevel = 100;
		crystalReportViewer1.Zoom(zoomLevel);
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		this.components = new System.ComponentModel.Container();
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmPrint));
		this.crystalReportViewer1 = new CrystalDecisions.Windows.Forms.CrystalReportViewer();
		this.imageList1 = new System.Windows.Forms.ImageList(this.components);
		base.SuspendLayout();
		this.crystalReportViewer1.ActiveViewIndex = -1;
		this.crystalReportViewer1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
		this.crystalReportViewer1.Cursor = System.Windows.Forms.Cursors.Default;
		this.crystalReportViewer1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.crystalReportViewer1.Location = new System.Drawing.Point(0, 0);
		this.crystalReportViewer1.Name = "crystalReportViewer1";
		this.crystalReportViewer1.Size = new System.Drawing.Size(654, 404);
		this.crystalReportViewer1.TabIndex = 0;
		this.imageList1.ImageStream = (System.Windows.Forms.ImageListStreamer)resources.GetObject("imageList1.ImageStream");
		this.imageList1.TransparentColor = System.Drawing.Color.Transparent;
		this.imageList1.Images.SetKeyName(0, "Export_32x32.png");
		this.imageList1.Images.SetKeyName(1, "Print_32x32.png");
		this.imageList1.Images.SetKeyName(2, "Refresh_32x32.png");
		this.imageList1.Images.SetKeyName(3, "Copy_32x32.png");
		this.imageList1.Images.SetKeyName(4, "Parameters_32x32.png");
		this.imageList1.Images.SetKeyName(5, "XtraChartsForAsp.EnlargedSmallIcon.png");
		this.imageList1.Images.SetKeyName(6, "First_32x32.png");
		this.imageList1.Images.SetKeyName(7, "Prev_32x32.png");
		this.imageList1.Images.SetKeyName(8, "Next_32x32 (3).png");
		this.imageList1.Images.SetKeyName(9, "Last_32x32.png");
		this.imageList1.Images.SetKeyName(10, "Find_32x32.png");
		this.imageList1.Images.SetKeyName(11, "Close_32x32.png");
		this.imageList1.Images.SetKeyName(12, "ZoomIn_32x32.png");
		this.imageList1.Images.SetKeyName(13, "DocumentMap_32x32.png");
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(654, 404);
		base.Controls.Add(this.crystalReportViewer1);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmPrint";
		this.Text = "Print Report";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		base.KeyDown += new System.Windows.Forms.KeyEventHandler(FrmPrint_KeyDown);
		base.ResumeLayout(false);
	}
}
