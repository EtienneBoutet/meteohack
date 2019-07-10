-- Drop table

-- DROP TABLE public.monthly_climate;

CREATE TABLE public.monthly_climate (
	id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	bs float8 NULL,
	"BS%" float8 NULL,
	cdd float8 NULL,
	"Climate Identifier" varchar NULL,
	d float8 NULL,
	dwbs float8 NULL,
	dwp float8 NULL,
	dws float8 NULL,
	dwtm float8 NULL,
	dwtn float8 NULL,
	dwtx float8 NULL,
	elevation float8 NULL,
	hdd float8 NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	"Month" int4 NULL,
	p float8 NULL,
	"P%N" float8 NULL,
	pd int4 NULL,
	province varchar NULL,
	s float8 NULL,
	"S%N" float8 NULL,
	s_g float8 NULL,
	"Station Name" varchar NULL,
	"TC Identifier" varchar NULL,
	tm float8 NULL,
	tn float8 NULL,
	tx float8 NULL,
	"WMO Identifier" int4 NULL,
	"Year" int4 NULL,
	CONSTRAINT monthly_climate_pk PRIMARY KEY (id)
);
CREATE INDEX monthly_climate_bs__idx ON public.monthly_climate USING btree ("BS%");
CREATE INDEX monthly_climate_bs_idx ON public.monthly_climate USING btree (bs);
CREATE INDEX monthly_climate_cdd_idx ON public.monthly_climate USING btree (cdd);
CREATE INDEX monthly_climate_climate_identifier_idx ON public.monthly_climate USING btree ("Climate Identifier");
CREATE INDEX monthly_climate_d_idx ON public.monthly_climate USING btree (d, dwbs, dwp, dws, dwtm, dwtn, dwtx);
CREATE INDEX monthly_climate_elevation_idx ON public.monthly_climate USING btree (elevation);
CREATE INDEX monthly_climate_hdd_idx ON public.monthly_climate USING btree (hdd);
CREATE INDEX monthly_climate_latitude_idx ON public.monthly_climate USING btree (latitude, longitude);
CREATE INDEX monthly_climate_month_idx ON public.monthly_climate USING btree ("Month", "Year");
CREATE INDEX monthly_climate_p_idx ON public.monthly_climate USING btree (p, "P%N", pd);
CREATE INDEX monthly_climate_province_idx ON public.monthly_climate USING btree (province);
CREATE INDEX monthly_climate_s_idx ON public.monthly_climate USING btree (s, "S%N", s_g);
CREATE INDEX monthly_climate_station_name_idx ON public.monthly_climate USING btree ("Station Name");
CREATE INDEX monthly_climate_tc_identifier_idx ON public.monthly_climate USING btree ("TC Identifier");
CREATE INDEX monthly_climate_tm_idx ON public.monthly_climate USING btree (tm);
CREATE INDEX monthly_climate_tn_idx ON public.monthly_climate USING btree (tn);
CREATE INDEX monthly_climate_tx_idx ON public.monthly_climate USING btree (tx);
CREATE INDEX monthly_climate_wmo_identifier_idx ON public.monthly_climate USING btree ("WMO Identifier");


copy monthly_climate from '/meteohack/monthly_climate.csv' csv header;
