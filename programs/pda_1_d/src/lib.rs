use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("4jiaRCGfD5YLTfWeAPDP9hwW6a9P1ZXF4uH66v1BXQT4");

// https://stackoverflow.com/questions/38088067/equivalent-of-func-or-function-in-rust
macro_rules! function {
	() => {{
		fn f() {}
		fn type_name_of<T>(_: T) -> &'static str {
			std::any::type_name::<T>()
		}
		let name = type_name_of(f);

		// Find and cut the rest of the path
		match &name[..name.len() - 3].rfind(':') {
			Some(pos) => &name[pos + 1..name.len() - 3],
			None => &name[..name.len() - 3],
		}
	}};
}


#[program]
pub mod pda_1_d {
	use super::*;

	pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
		msg!("{}:{}", function!(), line!());
		Ok(())
	}


	pub fn pda_create(ctx: Context<PdaCreate>) -> Result<()> {
		msg!("{}:{}", function!(), line!());

		let main: &mut Account<Main> = &mut ctx.accounts.main;
		let pda: &mut Account<Pda>   = &mut ctx.accounts.pda;

		msg!("{}", main.index);
		pda.index   = main.index;
		main.index += 1;
		Ok(())
	}

	pub fn pda_access(ctx: Context<PdaAccess>) -> Result<()> {
		msg!("{}:{}", function!(), line!());

		let pda: &mut Account<Pda>   = &mut ctx.accounts.pda;

		msg!("{}", pda.index);
		Ok(())
	}

	pub fn pda_access_by_index(ctx: Context<PdaAccessIndexParam>, index: u16) -> Result<()> {
		msg!("{}:{}", function!(), line!());

		let pda: &mut Account<Pda>   = &mut ctx.accounts.pda;

		msg!("{} / {}", pda.index, index);
		Ok(())
	}

}



#[account]
pub struct Main {
	pub index: u16,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(
		init,
		payer = signer,
		space = size_of::<Main>() + 8
	)]
	pub main: Account<'info, Main>,

	#[account(mut)]
	pub signer: Signer<'info>,

	pub system_program: Program<'info, System>,
}


#[account]
pub struct Pda {
	pub index: u16,
}

#[derive(Accounts)]
pub struct PdaCreate<'info> {

	#[account(
		init,
		seeds = [
			b"1D".as_ref(),
			//signer.key().as_ref(),
			main.index.to_le_bytes().as_ref(),
		],
		bump,
		payer = signer,
		space = size_of::<Pda>() + 8
	)]
	pub pda: Account<'info, Pda>,

	#[account(mut)]
	pub main: Account<'info, Main>,

	#[account(mut)]
	pub signer: Signer<'info>,

	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PdaAccess<'info> {

	#[account(mut)]
	pub pda: Account<'info, Pda>,

	#[account(mut)]
	pub signer: Signer<'info>,

	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(index: u16)]
pub struct PdaAccessIndexParam<'info> {

	#[account(
		seeds = [
			b"1D".as_ref(),
			index.to_le_bytes().as_ref(),
		],
		bump,
	)]
	pub pda: Account<'info, Pda>,

	#[account(mut)]
	pub signer: Signer<'info>,

	pub system_program: Program<'info, System>,
}