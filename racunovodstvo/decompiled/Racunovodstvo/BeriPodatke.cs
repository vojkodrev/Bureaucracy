using System;
using System.Data.Common;
using System.Data.SqlClient;
using System.Xml;

namespace Racunovodstvo;

public class BeriPodatke : Poizvedba
{
	private SqlDataReader sqlPodatki;

	private string formatDatuma = "ddMMyyyy";

	private string[] naslovi;

	private string[] podatki;

	public string[] vrniNaslove()
	{
		return naslovi;
	}

	public string[] vrniPodatke()
	{
		return podatki;
	}

	private string vrniKonto(string sifra)
	{
		XmlDocument xmlDocument = new XmlDocument();
		xmlDocument.Load(vrniDatotekoSKonti());
		string result = "";
		foreach (XmlElement childNode in xmlDocument.DocumentElement.ChildNodes)
		{
			string attribute = childNode.GetAttribute("Šifra");
			if (attribute == sifra)
			{
				return childNode.FirstChild.Value;
			}
			if (attribute == "osnovni konto")
			{
				result = childNode.FirstChild.Value;
			}
		}
		return result;
	}

	public BeriPodatke(DateTime datumOd, DateTime datumDo, string nastavitve)
		: base(datumOd, datumDo, nastavitve)
	{
		sqlPodatki = preberiRacune();
		naslovi = new string[((DbDataReader)(object)sqlPodatki).FieldCount + 1];
		if (!((DbDataReader)(object)sqlPodatki).HasRows)
		{
			throw new Exception("Ni podatkov iz tega obdobja.");
		}
		for (int i = 0; i < ((DbDataReader)(object)sqlPodatki).FieldCount; i++)
		{
			naslovi[i] = ((DbDataReader)(object)sqlPodatki).GetName(i);
		}
		naslovi[naslovi.Length - 1] = "Konto";
	}

	private string formatirajDouble(double stevilka)
	{
		return stevilka.ToString("0.00").Replace(',', '.');
	}

	public bool beri()
	{
		if (!((DbDataReader)(object)sqlPodatki).Read())
		{
			return false;
		}
		podatki = new string[((DbDataReader)(object)sqlPodatki).FieldCount + 1];
		for (int i = 0; i < ((DbDataReader)(object)sqlPodatki).FieldCount; i++)
		{
			try
			{
				switch (((DbDataReader)(object)sqlPodatki).GetName(i).ToUpper())
				{
				case "DATUMIZSTAVITVE":
				case "DATUMDUR":
				case "DATUMZAPADLOSTI":
					podatki[i] = ((DbDataReader)(object)sqlPodatki).GetDateTime(i).ToString(formatDatuma);
					break;
				case "STEVILKA":
				case "IDSTEVILKA":
				case "IMEPARTNERJA":
				case "OPISARTIKLA":
					podatki[i] = ((DbDataReader)(object)sqlPodatki).GetString(i);
					break;
				case "STEVILKAARTIKLA":
				{
					string text = ((DbDataReader)(object)sqlPodatki).GetString(i);
					podatki[i] = text;
					podatki[podatki.Length - 1] = vrniKonto(text);
					break;
				}
				case "ZNESEKSKUPAJ":
				case "DDVSKUPAJ":
				case "OSNOVASKUPAJ":
				case "ZNESEKARTIKEL":
				case "DDVARTIKEL":
				case "OSNOVAARTIKEL":
					podatki[i] = formatirajDouble(((DbDataReader)(object)sqlPodatki).GetDouble(i));
					break;
				}
			}
			catch
			{
				podatki[i] = "";
			}
		}
		return true;
	}
}
