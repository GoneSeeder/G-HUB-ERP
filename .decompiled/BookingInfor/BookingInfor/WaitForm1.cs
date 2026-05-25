using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using DevExpress.XtraWaitForm;

namespace BookingInfor;

public class WaitForm1 : WaitForm
{
	public enum WaitFormCommand
	{

	}

	private IContainer components = null;

	private ProgressPanel progressPanel1;

	private TableLayoutPanel tableLayoutPanel1;

	public WaitForm1()
	{
		InitializeComponent();
		progressPanel1.AutoHeight = true;
	}

	public override void SetCaption(string caption)
	{
		base.SetCaption(caption);
		progressPanel1.Caption = caption;
	}

	public override void SetDescription(string description)
	{
		base.SetDescription(description);
		progressPanel1.Description = description;
	}

	public override void ProcessCommand(Enum cmd, object arg)
	{
		base.ProcessCommand(cmd, arg);
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
		this.progressPanel1 = new DevExpress.XtraWaitForm.ProgressPanel();
		this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
		this.tableLayoutPanel1.SuspendLayout();
		base.SuspendLayout();
		this.progressPanel1.Appearance.BackColor = System.Drawing.Color.Transparent;
		this.progressPanel1.Appearance.Options.UseBackColor = true;
		this.progressPanel1.AppearanceCaption.Font = new System.Drawing.Font("Microsoft Sans Serif", 12f);
		this.progressPanel1.AppearanceCaption.Options.UseFont = true;
		this.progressPanel1.AppearanceDescription.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25f);
		this.progressPanel1.AppearanceDescription.Options.UseFont = true;
		this.progressPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.progressPanel1.ImageHorzOffset = 20;
		this.progressPanel1.Location = new System.Drawing.Point(0, 17);
		this.progressPanel1.Margin = new System.Windows.Forms.Padding(0, 3, 0, 3);
		this.progressPanel1.Name = "progressPanel1";
		this.progressPanel1.Size = new System.Drawing.Size(246, 39);
		this.progressPanel1.TabIndex = 0;
		this.progressPanel1.Text = "progressPanel1";
		this.tableLayoutPanel1.AutoSize = true;
		this.tableLayoutPanel1.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
		this.tableLayoutPanel1.BackColor = System.Drawing.Color.Transparent;
		this.tableLayoutPanel1.ColumnCount = 1;
		this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100f));
		this.tableLayoutPanel1.Controls.Add(this.progressPanel1, 0, 0);
		this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 0);
		this.tableLayoutPanel1.Name = "tableLayoutPanel1";
		this.tableLayoutPanel1.Padding = new System.Windows.Forms.Padding(0, 14, 0, 14);
		this.tableLayoutPanel1.RowCount = 1;
		this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100f));
		this.tableLayoutPanel1.Size = new System.Drawing.Size(246, 73);
		this.tableLayoutPanel1.TabIndex = 1;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		this.AutoSize = true;
		base.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
		base.ClientSize = new System.Drawing.Size(246, 73);
		base.Controls.Add(this.tableLayoutPanel1);
		this.DoubleBuffered = true;
		base.Name = "WaitForm1";
		base.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
		this.Text = "Form1";
		this.tableLayoutPanel1.ResumeLayout(false);
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
