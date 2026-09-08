using System;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace Racunovodstvo;

public class frmIzberiNastavitev : Form
{
	private IContainer components = null;

	private Button btnIzberi;

	private ComboBox comboSeznam;

	private GroupBox groupBox1;

	public frmIzberiNastavitev()
	{
		InitializeComponent();
	}

	private void frmIzberiNastavitev_FormClosed(object sender, FormClosedEventArgs e)
	{
		Application.Exit();
	}

	private void btnIzberi_Click(object sender, EventArgs e)
	{
		//IL_0041: Unknown result type (might be due to invalid IL or missing references)
		if (File.Exists(((Control)comboSeznam).Text))
		{
			frmRacunovodstvo frmRacunovodstvo2 = new frmRacunovodstvo(((Control)comboSeznam).Text);
			((Control)frmRacunovodstvo2).Show();
			((Control)this).Hide();
		}
		else
		{
			MessageBox.Show("Ta datoteka ne obstaja");
		}
	}

	private void frmIzberiNastavitev_Load(object sender, EventArgs e)
	{
		bool flag = true;
		string path = ".";
		path = Path.GetFullPath(path);
		string[] files = Directory.GetFiles(path, "*.xml");
		foreach (string text in files)
		{
			if (flag)
			{
				flag = false;
				((Control)comboSeznam).Text = text;
			}
			comboSeznam.Items.Add((object)text);
		}
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		((Form)this).Dispose(disposing);
	}

	private void InitializeComponent()
	{
		//IL_0002: Unknown result type (might be due to invalid IL or missing references)
		//IL_000c: Expected O, but got Unknown
		//IL_000d: Unknown result type (might be due to invalid IL or missing references)
		//IL_0017: Expected O, but got Unknown
		//IL_0018: Unknown result type (might be due to invalid IL or missing references)
		//IL_0022: Expected O, but got Unknown
		//IL_023d: Unknown result type (might be due to invalid IL or missing references)
		//IL_0264: Unknown result type (might be due to invalid IL or missing references)
		//IL_026e: Expected O, but got Unknown
		btnIzberi = new Button();
		comboSeznam = new ComboBox();
		groupBox1 = new GroupBox();
		((Control)groupBox1).SuspendLayout();
		((Control)this).SuspendLayout();
		((Control)btnIzberi).Location = new Point(6, 65);
		((Control)btnIzberi).Name = "btnIzberi";
		((Control)btnIzberi).Size = new Size(75, 23);
		((Control)btnIzberi).TabIndex = 1;
		((Control)btnIzberi).Text = "Izberi";
		((ButtonBase)btnIzberi).UseVisualStyleBackColor = true;
		((Control)btnIzberi).Click += btnIzberi_Click;
		comboSeznam.AutoCompleteMode = (AutoCompleteMode)3;
		comboSeznam.AutoCompleteSource = (AutoCompleteSource)256;
		((ListControl)comboSeznam).FormattingEnabled = true;
		((Control)comboSeznam).Location = new Point(6, 29);
		((Control)comboSeznam).Name = "comboSeznam";
		((Control)comboSeznam).Size = new Size(272, 21);
		((Control)comboSeznam).TabIndex = 0;
		((Control)groupBox1).Controls.Add((Control)(object)btnIzberi);
		((Control)groupBox1).Controls.Add((Control)(object)comboSeznam);
		((Control)groupBox1).Dock = (DockStyle)5;
		((Control)groupBox1).Location = new Point(10, 10);
		((Control)groupBox1).Name = "groupBox1";
		((Control)groupBox1).Size = new Size(294, 122);
		((Control)groupBox1).TabIndex = 2;
		groupBox1.TabStop = false;
		((Control)groupBox1).Text = "Nastavitve";
		((Form)this).AcceptButton = (IButtonControl)(object)btnIzberi;
		((ContainerControl)this).AutoScaleDimensions = new SizeF(6f, 13f);
		((ContainerControl)this).AutoScaleMode = (AutoScaleMode)1;
		((Form)this).ClientSize = new Size(314, 142);
		((Control)this).Controls.Add((Control)(object)groupBox1);
		((Form)this).FormBorderStyle = (FormBorderStyle)1;
		((Form)this).MaximizeBox = false;
		((Control)this).Name = "frmIzberiNastavitev";
		((Control)this).Padding = new Padding(10);
		((Form)this).StartPosition = (FormStartPosition)1;
		((Control)this).Text = "Racunovodstvo - Izberi nastavitev";
		((Form)this).FormClosed += new FormClosedEventHandler(frmIzberiNastavitev_FormClosed);
		((Form)this).Load += frmIzberiNastavitev_Load;
		((Control)groupBox1).ResumeLayout(false);
		((Control)this).ResumeLayout(false);
	}
}
