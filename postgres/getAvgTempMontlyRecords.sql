select
	"Latitude",
	"Longitude",
	"Tm",
	"TmOld",
	"Tm" - "TmOld" as "TmDiff",
	"Tx",
	"Date"
from
	(
		select (array_agg(t1.latitude))[1] as "Latitude",
		(array_agg(t1.longitude))[1] as "Longitude",
		(array_agg(t1.tm))[1] as "Tm",
		max(t2.tm) as "TmOld",
		(array_agg(t1.tx))[1] as "Tx",
		(array_agg(t1."Year"))[1]::text || '-' || lpad( (array_agg(t1."Month"))[1]::text, 2, '0') || '-00' as "Date"
	from
		monthly_climate t1
	left join monthly_climate t2 on
		t1."Year" > t2."Year"
		and t1."Month" = t2."Month"
		and t1."Station Name" = t2."Station Name"
	where
		t1.tm is not null
--		and t1."Year" < 1843
		and t2.tm is not null
	group by
		t1.id
	having
		max(t2.tm) < (array_agg(t1.tm))[1]
	order by
		"Date") r;
