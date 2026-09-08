using System;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace Racunovodstvo;

public class frmRacunovodstvo : Form
{
	private IContainer components = null;

	private GroupBox groupBox1;

	private Label label2;

	private Label label1;

	private DateTimePicker datumDo;

	private DateTimePicker datumOd;

	private Button btnIzvozi;

	private Button btnPrikazi;

	private GroupBox groupBox2;

	private DataGridView gridPrikaz;

	private SaveFileDialog shraniOkno;

	private string _nastavitve;

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
		//IL_0023: Unknown result type (might be due to invalid IL or missing references)
		//IL_002d: Expected O, but got Unknown
		//IL_002e: Unknown result type (might be due to invalid IL or missing references)
		//IL_0038: Expected O, but got Unknown
		//IL_0039: Unknown result type (might be due to invalid IL or missing references)
		//IL_0043: Expected O, but got Unknown
		//IL_0044: Unknown result type (might be due to invalid IL or missing references)
		//IL_004e: Expected O, but got Unknown
		//IL_004f: Unknown result type (might be due to invalid IL or missing references)
		//IL_0059: Expected O, but got Unknown
		//IL_005a: Unknown result type (might be due to invalid IL or missing references)
		//IL_0064: Expected O, but got Unknown
		//IL_0065: Unknown result type (might be due to invalid IL or missing references)
		//IL_006f: Expected O, but got Unknown
		//IL_01be: Unknown result type (might be due to invalid IL or missing references)
		//IL_01c8: Expected O, but got Unknown
		//IL_0249: Unknown result type (might be due to invalid IL or missing references)
		//IL_0253: Expected O, but got Unknown
		//IL_0497: Unknown result type (might be due to invalid IL or missing references)
		//IL_061a: Unknown result type (might be due to invalid IL or missing references)
		//IL_0639: Unknown result type (might be due to invalid IL or missing references)
		//IL_0643: Expected O, but got Unknown
		groupBox1 = new GroupBox();
		label2 = new Label();
		label1 = new Label();
		datumDo = new DateTimePicker();
		datumOd = new DateTimePicker();
		btnIzvozi = new Button();
		btnPrikazi = new Button();
		groupBox2 = new GroupBox();
		gridPrikaz = new DataGridView();
		shraniOkno = new SaveFileDialog();
		((Control)groupBox1).SuspendLayout();
		((Control)groupBox2).SuspendLayout();
		((ISupportInitialize)gridPrikaz).BeginInit();
		((Control)this).SuspendLayout();
		((Control)groupBox1).Controls.Add((Control)(object)label2);
		((Control)groupBox1).Controls.Add((Control)(object)label1);
		((Control)groupBox1).Controls.Add((Control)(object)datumDo);
		((Control)groupBox1).Controls.Add((Control)(object)datumOd);
		((Control)groupBox1).Controls.Add((Control)(object)btnIzvozi);
		((Control)groupBox1).Controls.Add((Control)(object)btnPrikazi);
		((Control)groupBox1).Dock = (DockStyle)1;
		((Control)groupBox1).Location = new Point(10, 10);
		((Control)groupBox1).Name = "groupBox1";
		((Control)groupBox1).Size = new Size(887, 92);
		((Control)groupBox1).TabIndex = 0;
		groupBox1.TabStop = false;
		((Control)groupBox1).Text = "Nastavitve prikaza";
		((Control)label2).AutoSize = true;
		((Control)label2).Font = new Font("Microsoft Sans Serif", 8.25f, (FontStyle)1, (GraphicsUnit)3, (byte)238);
		((Control)label2).Location = new Point(278, 29);
		((Control)label2).Name = "label2";
		((Control)label2).Size = new Size(27, 13);
		((Control)label2).TabIndex = 5;
		((Control)label2).Text = "Do:";
		((Control)label1).AutoSize = true;
		((Control)label1).Font = new Font("Microsoft Sans Serif", 8.25f, (FontStyle)1, (GraphicsUnit)3, (byte)238);
		((Control)label1).Location = new Point(24, 29);
		((Control)label1).Name = "label1";
		((Control)label1).Size = new Size(27, 13);
		((Control)label1).TabIndex = 4;
		((Control)label1).Text = "Od:";
		((Control)datumDo).Location = new Point(311, 25);
		((Control)datumDo).Name = "datumDo";
		((Control)datumDo).Size = new Size(200, 20);
		((Control)datumDo).TabIndex = 1;
		((Control)datumOd).Location = new Point(57, 25);
		((Control)datumOd).Name = "datumOd";
		((Control)datumOd).Size = new Size(200, 20);
		((Control)datumOd).TabIndex = 0;
		((Control)btnIzvozi).Location = new Point(138, 51);
		((Control)btnIzvozi).Name = "btnIzvozi";
		((Control)btnIzvozi).Size = new Size(75, 23);
		((Control)btnIzvozi).TabIndex = 3;
		((Control)btnIzvozi).Text = "Izvozi";
		((ButtonBase)btnIzvozi).UseVisualStyleBackColor = true;
		((Control)btnIzvozi).Click += btnIzvozi_Click;
		((Control)btnPrikazi).Location = new Point(57, 51);
		((Control)btnPrikazi).Name = "btnPrikazi";
		((Control)btnPrikazi).Size = new Size(75, 23);
		((Control)btnPrikazi).TabIndex = 2;
		((Control)btnPrikazi).Text = "Prikaži";
		((ButtonBase)btnPrikazi).UseVisualStyleBackColor = true;
		((Control)btnPrikazi).Click += btnPrikazi_Click;
		((Control)groupBox2).Controls.Add((Control)(object)gridPrikaz);
		((Control)groupBox2).Dock = (DockStyle)5;
		((Control)groupBox2).Location = new Point(10, 102);
		((Control)groupBox2).Name = "groupBox2";
		((Control)groupBox2).Padding = new Padding(10);
		((Control)groupBox2).Size = new Size(887, 551);
		((Control)groupBox2).TabIndex = 1;
		groupBox2.TabStop = false;
		((Control)groupBox2).Text = "Prikaz";
		gridPrikaz.AllowUserToAddRows = false;
		gridPrikaz.AllowUserToDeleteRows = false;
		gridPrikaz.ColumnHeadersHeightSizeMode = (DataGridViewColumnHeadersHeightSizeMode)2;
		((Control)gridPrikaz).Dock = (DockStyle)5;
		((Control)gridPrikaz).Location = new Point(10, 23);
		((Control)gridPrikaz).Name = "gridPrikaz";
		gridPrikaz.ReadOnly = true;
		((Control)gridPrikaz).Size = new Size(867, 518);
		((Control)gridPrikaz).TabIndex = 0;
		((Control)gridPrikaz).TabStop = false;
		((FileDialog)shraniOkno).DefaultExt = "txt";
		((FileDialog)shraniOkno).FileName = "izvoz.txt";
		((Form)this).AcceptButton = (IButtonControl)(object)btnPrikazi;
		((ContainerControl)this).AutoScaleDimensions = new SizeF(6f, 13f);
		((ContainerControl)this).AutoScaleMode = (AutoScaleMode)1;
		((Form)this).ClientSize = new Size(907, 663);
		((Control)this).Controls.Add((Control)(object)groupBox2);
		((Control)this).Controls.Add((Control)(object)groupBox1);
		((Control)this).Name = "frmRacunovodstvo";
		((Control)this).Padding = new Padding(10);
		((Control)this).Text = "Računovodstvo - Izvoz";
		((Form)this).FormClosed += new FormClosedEventHandler(frmRacunovodstvo_FormClosed);
		((Form)this).Load += frmRacunovodstvo_Load;
		((Control)groupBox1).ResumeLayout(false);
		((Control)groupBox1).PerformLayout();
		((Control)groupBox2).ResumeLayout(false);
		((ISupportInitialize)gridPrikaz).EndInit();
		((Control)this).ResumeLayout(false);
	}

	public frmRacunovodstvo(string nastavitve)
	{
		InitializeComponent();
		_nastavitve = nastavitve;
	}

	private void btnPrikazi_Click(object sender, EventArgs e)
	{
		//IL_00cc: Unknown result type (might be due to invalid IL or missing references)
		try
		{
			gridPrikaz.Rows.Clear();
			gridPrikaz.Columns.Clear();
			BeriPodatke beriPodatke = new BeriPodatke(datumOd.Value, datumDo.Value, _nastavitve);
			int num = 0;
			string[] array = beriPodatke.vrniNaslove();
			foreach (string text in array)
			{
				gridPrikaz.Columns.Add("col" + Convert.ToString(num++), text);
			}
			while (beriPodatke.beri())
			{
				gridPrikaz.Rows.Add((object[])beriPodatke.vrniPodatke());
			}
			beriPodatke.zapriPovezavo();
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.Message);
		}
	}

	private void btnIzvozi_Click(object sender, EventArgs e)
	{
		//IL_00bb: Unknown result type (might be due to invalid IL or missing references)
		//IL_0008: Unknown result type (might be due to invalid IL or missing references)
		//IL_000e: Invalid comparison between Unknown and I4
		try
		{
			if ((int)((CommonDialog)shraniOkno).ShowDialog() != 1)
			{
				return;
			}
			StreamWriter streamWriter = File.CreateText(((FileDialog)shraniOkno).FileName);
			BeriPodatke beriPodatke = new BeriPodatke(datumOd.Value, datumDo.Value, _nastavitve);
			string text = "";
			while (beriPodatke.beri())
			{
				string[] array = beriPodatke.vrniPodatke();
				if (text != array[3])
				{
					streamWriter.WriteLine("R{0,-8}{1,-8}{2,-8}{3,-10}{4,10}{5,10}{6,10}{11,-20}{12,-50}", (object?[])array);
				}
				streamWriter.WriteLine("A{14,-6}{7,38}{8,10}{9,10}{10,-50}", (object?[])array);
				text = array[3];
			}
			beriPodatke.zapriPovezavo();
			streamWriter.Close();
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.Message);
		}
	}

	private void frmRacunovodstvo_Load(object sender, EventArgs e)
	{
		datumOd.Value = DateTime.Today.AddMonths(-1);
		((Control)this).Text = ((Control)this).Text + " - " + _nastavitve;
	}

	private void frmRacunovodstvo_FormClosed(object sender, FormClosedEventArgs e)
	{
		Application.Exit();
	}
}
