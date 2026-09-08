using System;
using System.Data.Common;
using System.Data.SqlClient;
using System.IO;
using System.Xml;
using Properties;

namespace Racunovodstvo;

public class Poizvedba
{
	public static string isoFormatDatuma = "yyyy-MM-dd\\T00:00:00";

	private SqlConnection sqlPovezava;

	private DateTime _datumOd;

	private DateTime _datumDo;

	private string uporabniskoIme;

	private string geslo;

	private string naslov;

	private string bazaRacuni;

	private string bazaPP;

	private string datotekaKonti;

	public Poizvedba(DateTime datumOd, DateTime datumDo, string nastavitve)
	{
		//IL_0038: Unknown result type (might be due to invalid IL or missing references)
		//IL_0042: Expected O, but got Unknown
		base._002Ector();
		beriXMLNastavitve(nastavitve);
		_datumDo = datumDo.AddDays(1.0);
		_datumOd = datumOd;
		sqlPovezava = new SqlConnection(Settings.Default.SqlConnectionString);
		((DbConnection)(object)sqlPovezava).Open();
	}

	private void beriXMLNastavitve(string nastavitve)
	{
		XmlDocument xmlDocument = new XmlDocument();
		xmlDocument.Load(nastavitve);
		XmlElement documentElement = xmlDocument.DocumentElement;
		foreach (XmlNode childNode in documentElement.ChildNodes)
		{
			switch (childNode.Name)
			{
			case "konti":
				datotekaKonti = Path.GetFullPath(childNode.FirstChild.Value);
				break;
			case "bazaPoslovniPartnerji":
				bazaPP = childNode.FirstChild.Value;
				break;
			case "bazaRacuni":
				bazaRacuni = childNode.FirstChild.Value;
				break;
			case "naslov":
				naslov = childNode.FirstChild.Value;
				break;
			case "geslo":
				geslo = childNode.FirstChild.Value;
				break;
			case "uporabniskoIme":
				uporabniskoIme = childNode.FirstChild.Value;
				break;
			}
		}
		if (!File.Exists(datotekaKonti))
		{
			throw new Exception("Datoteka s konti ne obstaja");
		}
	}

	public void zapriPovezavo()
	{
		((DbConnection)(object)sqlPovezava).Close();
	}

	public SqlDataReader preberiRacune()
	{
		//IL_00b0: Unknown result type (might be due to invalid IL or missing references)
		//IL_00b6: Expected O, but got Unknown
		string text = _datumOd.ToString(isoFormatDatuma);
		string text2 = _datumDo.ToString(isoFormatDatuma);
		string text3 = "select rac.DatumIzstavitve, rac.datumDUR, rac.datumZapadlosti, rac.Stevilka, rac.Znesek as ZnesekSkupaj, (rac.znesek / 1.22) * 0.22 as DDVSkupaj, rac.znesek / 1.22 as OsnovaSkupaj, racspec.znesek as znesekArtikel, (racspec.znesekbrezdavka - (racspec.znesekbrezdavka * (racspec.rabat / 100))) * 0.22 as DDVArtikel, racspec.znesekbrezdavka - (racspec.znesekbrezdavka * (racspec.rabat / 100)) as osnovaArtikel,  art.opis as opisArtikla, par.idStevilka, rac.ImePartnerja, racspec.artikel as stevilkaArtikla  from " + bazaRacuni + ".dbo.racuni rac left join " + bazaRacuni + ".dbo.racunispecifikacija racspec on racspec.stevilka = rac.stevilka left join " + bazaPP + ".dbo.partner par on rac.sifrapartnerja = par.sifra left join " + bazaPP + ".dbo.artikel art on art.artikel = racspec.artikel where '" + text + "' <= rac.datumizstavitve and '" + text2 + "' > rac.datumizstavitve order by rac.stevilka";
		SqlCommand val = new SqlCommand(text3, sqlPovezava);
		return val.ExecuteReader();
	}

	public string vrniDatotekoSKonti()
	{
		return datotekaKonti;
	}
}
