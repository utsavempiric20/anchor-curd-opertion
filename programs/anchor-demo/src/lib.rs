use anchor_lang::prelude::*;

declare_id!("F6DYjJGowRao4fxozyWLX329GPqzZSvaC4cxJNaQ9dWC");

#[program]
pub mod anchor_demo {

    use super::*;

    pub fn create_user(
        ctx: Context<SetUser>,
        user_pub_key: Pubkey,
        user_name: String,
        user_age: u8,
    ) -> Result<()> {
        let user_data = &mut ctx.accounts.user_account;
        user_data.user_pubkey = ctx.accounts.user.key();
        user_data.username = user_name;
        user_data.age = user_age;
        Ok(())
    }

    pub fn update_user(ctx: Context<UpdateUser>, new_username: String, new_age: u8) -> Result<()> {
        let updated_userdata = &mut ctx.accounts.user_data;
        updated_userdata.username = new_username;
        updated_userdata.age = new_age;
        Ok(())
    }

    pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
        let delete_userdata = &mut ctx.accounts.user_data;
        delete_userdata.username.clear();
        delete_userdata.age = 0;

        let dest_lamports = ctx.accounts.reciever.lamports();
        **ctx.accounts.reciever.lamports.borrow_mut() = dest_lamports
            .checked_add(delete_userdata.to_account_info().lamports())
            .unwrap();

        **delete_userdata.to_account_info().lamports.borrow_mut() = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetUser<'info> {
    #[account(init, payer = user , space = 8 + 32 + 1 + 100)]
    pub user_account: Account<'info, User>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
    #[account(mut)]
    pub user_data: Account<'info, User>,
}

#[derive(Accounts)]
pub struct DeleteUser<'info> {
    #[account(mut)]
    pub user_data: Account<'info, User>,
    pub reciever: AccountInfo<'info>,
}

#[account]
pub struct User {
    user_pubkey: Pubkey,
    username: String,
    age: u8,
}
